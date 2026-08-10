"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { MembroFormSchema, type MembroFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createMembro(state: MembroFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder da IC pode cadastrar membros." };
  }

  const validatedFields = MembroFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    birthDate: formData.get("birthDate"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, birthDate, phone, address, role } = validatedFields.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: { name, email, passwordHash, birthDate: new Date(birthDate), phone, address, role },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Já existe um membro com este e-mail."] } };
    }
    throw error;
  }

  revalidatePath("/membros");
  return { message: "success" };
}

export async function deleteMembro(id: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder da IC pode remover membros.");
  }
  if (session.userId === id) {
    throw new Error("Você não pode remover sua própria conta.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/membros");
}
