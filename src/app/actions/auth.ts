"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { LoginFormSchema, type LoginFormState } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

export async function logout() {
  await deleteSession();
  redirect("/login");
}
