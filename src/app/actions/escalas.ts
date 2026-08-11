"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EscalaFormSchema, type EscalaFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createEscala(state: EscalaFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder pode montar a escala de intercessão." };
  }

  const validatedFields = EscalaFormSchema.safeParse({
    tipo: formData.get("tipo"),
    data: formData.get("data"),
    observacao: formData.get("observacao"),
    participantes: formData.getAll("participantes"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { tipo, data, observacao, participantes } = validatedFields.data;

  await prisma.escala.create({
    data: {
      tipo,
      data: new Date(data),
      observacao: observacao || null,
      participantes: {
        create: participantes.map((userId) => ({ userId })),
      },
    },
  });

  revalidatePath("/inicio");
  revalidatePath("/escalas");
  redirect("/escalas");
}

export async function deleteEscala(id: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover uma escala.");
  }

  await prisma.escala.delete({ where: { id } });
  revalidatePath("/inicio");
  revalidatePath("/escalas");
}
