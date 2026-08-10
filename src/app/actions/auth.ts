"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import {
  LoginFormSchema,
  SignupFormSchema,
  type LoginFormState,
  type SignupFormState,
} from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isUploadableFile, uploadAvatar } from "@/lib/storage";

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

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { message: "E-mail ou senha inválidos." };
  }

  await createSession(user.id, user.role);
  redirect("/membros");
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
    address: formData.get("address"),
    role: formData.get("role"),
    inviteCode: formData.get("inviteCode"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, birthDate, phone, address, role, inviteCode } =
    validatedFields.data;

  if (role === "LIDER" && inviteCode !== process.env.LIDER_INVITE_CODE) {
    return { errors: { inviteCode: ["Código de convite inválido."] } };
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

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        birthDate: new Date(birthDate),
        phone,
        address,
        role,
        avatarUrl,
      },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Já existe uma conta com este e-mail."] } };
    }
    throw error;
  }

  await createSession(userId, role);
  redirect("/membros");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
