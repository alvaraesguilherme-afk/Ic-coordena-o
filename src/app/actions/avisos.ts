"use server";

import { revalidatePath } from "next/cache";
import { AvisoFormSchema, type AvisoFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";
import { isUploadableFile, uploadAvisoCapa } from "@/lib/storage";

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
    link: formData.get("link"),
    expiraEm: formData.get("expiraEm"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, conteudo, dataEvento, local, link, expiraEm } = validatedFields.data;

  const capaFile = formData.get("capa");
  let capaUrl: string | null = null;
  if (isUploadableFile(capaFile) && capaFile.size > 0) {
    try {
      capaUrl = await uploadAvisoCapa(capaFile, session.userId);
    } catch (error) {
      return { message: error instanceof Error ? error.message : "Falha ao enviar a foto." };
    }
  }

  await prisma.aviso.create({
    data: {
      titulo: titulo || null,
      conteudo,
      dataEvento: dataEvento ? new Date(dataEvento) : null,
      local: local || null,
      link: link || null,
      capaUrl,
      // Fica visível até o fim do dia escolhido, depois some sozinho das listagens.
      expiraEm: expiraEm ? new Date(`${expiraEm}T23:59:59`) : null,
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
      title: titulo
        ? `${dataEvento ? "Novo evento" : "Novo aviso"}: ${titulo}`
        : dataEvento
          ? "Novo evento"
          : "Novo aviso",
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
