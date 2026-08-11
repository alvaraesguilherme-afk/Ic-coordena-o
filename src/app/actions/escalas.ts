"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EscalaFormSchema, type EscalaFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { pessoaIndisponivel } from "@/lib/disponibilidade";

export async function createEscala(state: EscalaFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder pode montar a escala." };
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

  if (tipo === "MIDIA") {
    return { message: "A escala de mídia agora é organizada pela grade mensal." };
  }

  const dataEscala = new Date(data);

  for (const userId of participantes) {
    if (await pessoaIndisponivel(userId, dataEscala)) {
      const pessoa = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      return {
        errors: {
          participantes: [
            `${pessoa?.name ?? "Essa pessoa"} já está escalado(a) em outro compromisso nesse dia.`,
          ],
        },
      };
    }
  }

  await prisma.escala.create({
    data: {
      tipo,
      data: dataEscala,
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
