"use server";

import { revalidatePath, updateTag } from "next/cache";
import bcrypt from "bcryptjs";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { RedefinirSenhaFormSchema, type RedefinirSenhaFormState } from "@/lib/definitions";

async function podeGerenciarMembro(membroId: string) {
  const session = await verifySession();

  const membro = await prisma.user.findUniqueOrThrow({
    where: { id: membroId },
    select: { redeId: true, igreja: { select: { redeId: true } } },
  });
  const membroRedeId = membro.igreja?.redeId ?? membro.redeId;

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, redeId: true, role: true },
  });

  const pode =
    session.userId !== membroId &&
    (currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === membroRedeId));

  return pode;
}

export async function redefinirSenhaMembro(
  membroId: string,
  state: RedefinirSenhaFormState,
  formData: FormData
): Promise<RedefinirSenhaFormState> {
  const validatedFields = RedefinirSenhaFormSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  if (!(await podeGerenciarMembro(membroId))) {
    return { message: "Você não tem permissão pra redefinir a senha dessa pessoa." };
  }

  const passwordHash = await bcrypt.hash(validatedFields.data.password, 10);

  await prisma.user.update({
    where: { id: membroId },
    // Zera a sessão ativa: quem tinha a conta aberta em outro aparelho precisa
    // entrar de novo com a senha nova.
    data: { passwordHash, sessionId: null, sessionExpiresAt: null },
  });

  return { success: true };
}

export async function deleteMembro(id: string, redeId: string, igrejaId: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover membros.");
  }
  if (session.userId === id) {
    throw new Error("Você não pode remover sua própria conta.");
  }

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, redeId: true },
  });

  if (!currentUser.isAdmin && currentUser.redeId !== redeId) {
    throw new Error("Você só pode remover membros da sua própria rede.");
  }

  await prisma.user.delete({ where: { id } });
  updateTag("membros-list");
  revalidatePath(`/redes/${redeId}/igrejas/${igrejaId}`);
}
