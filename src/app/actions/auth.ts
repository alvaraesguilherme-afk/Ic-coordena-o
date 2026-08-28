"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import {
  LoginFormSchema,
  SignupFormSchema,
  SolicitarCodigoFormSchema,
  EsqueciSenhaFormSchema,
  type LoginFormState,
  type SignupFormState,
  type EsqueciSenhaFormState,
} from "@/lib/definitions";
import { cookies } from "next/headers";
import { createSession, deleteSession, decrypt } from "@/lib/session";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isUploadableFile, uploadAvatar, deleteArquivoPorUrl, AVATARS_BUCKET } from "@/lib/storage";
import { capitalizarNome } from "@/lib/user";
import { enviarEmail } from "@/lib/email";

const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const RESET_CODE_COOLDOWN_MS = 60 * 1000;
const RESET_CODE_MAX_TENTATIVAS = 5;

// Trava só depois de várias tentativas seguidas erradas na MESMA conta — gera
// poucos falsos positivos (ninguém erra a senha 8x sem querer) mas barra
// força bruta. Zera sozinho a cada acerto, sem exigir ação de ninguém.
const LOGIN_MAX_TENTATIVAS = 8;
const LOGIN_BLOQUEIO_MS = 15 * 60 * 1000;

async function buscarUsuarioPorIdentificador(identificador: string) {
  if (identificador.includes("@")) {
    return prisma.user.findUnique({ where: { email: identificador.toLowerCase() } });
  }
  const digits = identificador.replace(/\D/g, "");
  if (digits.length === 0) return null;
  const candidatos = await prisma.user.findMany({ where: { phone: { not: null } } });
  return candidatos.find((c) => c.phone?.replace(/\D/g, "") === digits) ?? null;
}

export async function login(state: LoginFormState, formData: FormData) {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.loginLockedUntil && user.loginLockedUntil > new Date()) {
    const minutos = Math.ceil((user.loginLockedUntil.getTime() - Date.now()) / 60000);
    return {
      message: `Muitas tentativas erradas com essa conta. Tente de novo em ${minutos} minuto${minutos === 1 ? "" : "s"}.`,
    };
  }

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    if (user) {
      const tentativas = user.loginFailedAttempts + 1;
      const bloqueou = tentativas >= LOGIN_MAX_TENTATIVAS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginFailedAttempts: bloqueou ? 0 : tentativas,
          loginLockedUntil: bloqueou ? new Date(Date.now() + LOGIN_BLOQUEIO_MS) : null,
        },
      });
    }
    return { message: "E-mail ou senha inválidos." };
  }

  if (user.loginFailedAttempts > 0 || user.loginLockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { loginFailedAttempts: 0, loginLockedUntil: null },
    });
  }

  // Conta de demonstração permanente (ver memória do projeto) — acesso livre em
  // quantos aparelhos quiser, igual líder/pastor, nunca trava por "em uso em
  // outro aparelho".
  const semLimiteDeAparelho = user.role !== "MEMBRO" || user.email === "teste.membro@impulse.app";

  if (
    !semLimiteDeAparelho &&
    user.sessionId &&
    user.sessionExpiresAt &&
    user.sessionExpiresAt > new Date()
  ) {
    return {
      message: "Essa conta já está em uso em outro aparelho. Saia lá primeiro para entrar aqui.",
    };
  }

  if (!semLimiteDeAparelho) {
    const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionId: crypto.randomUUID(), sessionExpiresAt },
    });
  }

  await createSession(user.id, user.role);
  redirect("/inicio");
}

// Autoatendimento sem custo (SMTP do Gmail, sem provedor pago): identifica a
// conta pelo e-mail ou telefone cadastrado, gera um código de 6 dígitos com
// validade curta e manda por e-mail — só quem tem acesso à caixa de entrada
// consegue trocar a senha (ver confirmarRecuperacao).
export async function solicitarCodigoRecuperacao(
  state: EsqueciSenhaFormState,
  formData: FormData
): Promise<EsqueciSenhaFormState> {
  const validatedFields = SolicitarCodigoFormSchema.safeParse({
    identificador: formData.get("identificador"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { identificador } = validatedFields.data;
  const user = await buscarUsuarioPorIdentificador(identificador);

  if (!user) {
    return { message: "Não achamos nenhuma conta com esse e-mail ou telefone." };
  }

  if (user.resetCodeSentAt && Date.now() - user.resetCodeSentAt.getTime() < RESET_CODE_COOLDOWN_MS) {
    return {
      etapa: "codigo",
      identificador,
      message: "Já enviamos um código. Espera um minutinho antes de pedir outro.",
    };
  }

  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  const resetCodeHash = await bcrypt.hash(codigo, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetCodeHash,
      resetCodeExpiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
      resetCodeAttempts: 0,
      resetCodeSentAt: new Date(),
    },
  });

  try {
    await enviarEmail(
      user.email,
      "Seu código de recuperação — Impulse",
      `<p>Seu código de verificação é <strong>${codigo}</strong>. Ele vale por 10 minutos. Se não foi você quem pediu, ignore este e-mail.</p>`
    );
  } catch {
    return { message: "Não conseguimos enviar o e-mail agora. Tenta de novo em instantes." };
  }

  return {
    etapa: "codigo",
    identificador,
    message: "Enviamos um código de 6 dígitos pro e-mail cadastrado nessa conta.",
  };
}

export async function confirmarRecuperacao(
  state: EsqueciSenhaFormState,
  formData: FormData
): Promise<EsqueciSenhaFormState> {
  const identificadorBruto = String(formData.get("identificador") ?? "");

  const validatedFields = EsqueciSenhaFormSchema.safeParse({
    identificador: identificadorBruto,
    codigo: formData.get("codigo"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      etapa: "codigo",
      identificador: identificadorBruto,
    };
  }

  const { identificador, codigo, password } = validatedFields.data;
  const user = await buscarUsuarioPorIdentificador(identificador);

  if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
    return { message: "Peça um novo código pra continuar." };
  }

  if (user.resetCodeExpiresAt < new Date()) {
    return { message: "Esse código expirou. Peça um novo." };
  }

  if (user.resetCodeAttempts >= RESET_CODE_MAX_TENTATIVAS) {
    return { message: "Muitas tentativas erradas com esse código. Peça um novo." };
  }

  const codigoValido = await bcrypt.compare(codigo, user.resetCodeHash);

  if (!codigoValido) {
    await prisma.user.update({
      where: { id: user.id },
      data: { resetCodeAttempts: { increment: 1 } },
    });
    return {
      errors: { codigo: ["Código incorreto."] },
      etapa: "codigo",
      identificador,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      sessionId: null,
      sessionExpiresAt: null,
      resetCodeHash: null,
      resetCodeExpiresAt: null,
      resetCodeAttempts: 0,
      resetCodeSentAt: null,
    },
  });

  return { success: true };
}

export async function signup(
  state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    birthDate: formData.get("birthDate"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    inviteCode: formData.get("inviteCode"),
    pastorCode: formData.get("pastorCode"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, birthDate, phone, role, inviteCode, pastorCode } =
    validatedFields.data;

  if (role === "LIDER" && inviteCode !== process.env.LIDER_INVITE_CODE) {
    return { errors: { inviteCode: ["Código de convite inválido."] } };
  }

  if (role === "PASTOR" && pastorCode !== process.env.PASTOR_INVITE_CODE) {
    return { errors: { pastorCode: ["Código de pastor inválido."] } };
  }

  const avatarFile = formData.get("avatar");
  if (!isUploadableFile(avatarFile) || avatarFile.size === 0) {
    return { errors: { avatar: ["A foto de perfil é obrigatória."] } };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["Já existe uma conta com este e-mail."] } };
  }

  let avatarUrl: string;
  try {
    avatarUrl = await uploadAvatar(avatarFile, email);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Falha ao enviar a foto." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const sessionExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        name: capitalizarNome(name),
        email,
        passwordHash,
        birthDate: new Date(birthDate),
        phone: phone || null,
        role,
        avatarUrl,
        ...(role === "MEMBRO" && { sessionId: crypto.randomUUID(), sessionExpiresAt }),
        ...(role === "PASTOR" && { isAdmin: true, onboardingCompleto: true }),
      },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Já existe uma conta com este e-mail."] } };
    }
    throw error;
  }

  updateTag("membros-list");
  await createSession(userId, role);
  redirect(role === "PASTOR" ? "/inicio" : "/onboarding");
}

// Direito de eliminação (LGPD, art. 18, VI): a própria pessoa apaga a conta e os dados
// pessoais associados. Cascateia via schema (escalas, presenças, avisos, links, playlists,
// áreas de servo etc.) e remove a foto de perfil do Storage antes de apagar o registro.
export async function apagarMinhaConta() {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatarUrl: true },
  });

  if (user?.avatarUrl) {
    await deleteArquivoPorUrl(AVATARS_BUCKET, user.avatarUrl).catch(() => {});
  }

  await prisma.user.delete({ where: { id: session.userId } });
  updateTag("membros-list");
  await deleteSession();
  redirect("/login");
}

export async function logout() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (session?.userId) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { sessionId: null, sessionExpiresAt: null },
    });
  }

  await deleteSession();
  redirect("/login");
}
