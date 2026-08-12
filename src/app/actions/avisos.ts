"use server";

import { revalidatePath } from "next/cache";
import { AvisoFormSchema, type AvisoFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";

export async function createAviso(state: AvisoFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder pode publicar avisos." };
  }

  const validatedFields = AvisoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    conteudo: formData.get("conteudo"),
    dataEvento: formData.get("dataEvento"),
    local: formData.get("local"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, conteudo, dataEvento, local } = validatedFields.data;

  await prisma.aviso.create({
    data: {
      titulo,
      conteudo,
      dataEvento: dataEvento ? new Date(dataEvento) : null,
      local: local || null,
      autorId: session.userId,
    },
  });

  revalidatePath("/novidades");

  const destinatarios = await prisma.user.findMany({
    where: { id: { not: session.userId } },
    select: { id: true },
  });

  await sendPushToUsers(
    destinatarios.map((u) => u.id),
    {
      title: dataEvento ? `Novo evento: ${titulo}` : `Novo aviso: ${titulo}`,
      body: conteudo,
      url: "/novidades",
    }
  );

  return { message: "success" };
}

export async function deleteAviso(id: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover avisos.");
  }

  await prisma.aviso.delete({ where: { id } });
  revalidatePath("/novidades");
}
