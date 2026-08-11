"use server";

import { revalidatePath } from "next/cache";
import { AvisoFormSchema, type AvisoFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createAviso(state: AvisoFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder pode publicar avisos." };
  }

  const validatedFields = AvisoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    conteudo: formData.get("conteudo"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, conteudo } = validatedFields.data;

  await prisma.aviso.create({
    data: { titulo, conteudo, autorId: session.userId },
  });

  revalidatePath("/avisos");
  return { message: "success" };
}

export async function deleteAviso(id: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover avisos.");
  }

  await prisma.aviso.delete({ where: { id } });
  revalidatePath("/avisos");
}
