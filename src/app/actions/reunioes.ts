"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ReuniaoFormSchema, type ReuniaoFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createReuniao(state: ReuniaoFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder da IC pode criar reuniões." };
  }

  const validatedFields = ReuniaoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
    descricao: formData.get("descricao"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, data, descricao } = validatedFields.data;

  const membros = await prisma.user.findMany({ select: { id: true } });

  const reuniao = await prisma.reuniao.create({
    data: {
      titulo,
      data: new Date(data),
      descricao: descricao || null,
      presencas: {
        create: membros.map((membro) => ({ userId: membro.id })),
      },
    },
  });

  revalidatePath("/reunioes");
  redirect(`/reunioes/${reuniao.id}`);
}

export async function setPresenca(reuniaoId: string, userId: string, presente: boolean) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder da IC pode registrar presença.");
  }

  await prisma.presenca.update({
    where: { reuniaoId_userId: { reuniaoId, userId } },
    data: { presente },
  });

  revalidatePath(`/reunioes/${reuniaoId}`);
}
