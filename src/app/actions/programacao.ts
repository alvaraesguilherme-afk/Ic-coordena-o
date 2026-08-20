"use server";

import { revalidatePath } from "next/cache";
import { ProgramacaoFormSchema, type ProgramacaoFormState } from "@/lib/definitions";
import { podeGerenciarLinks } from "@/lib/links";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";
import { isUploadableFile, uploadLinkCapa } from "@/lib/storage";

async function exigirGerenciarProgramacao() {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: {
      isAdmin: true,
      role: true,
      supervisorMidia: true,
      supervisorIntegracao: true,
      supervisorIntercessao: true,
    },
  });
  if (!podeGerenciarLinks(currentUser)) {
    throw new Error("Você não tem permissão para gerenciar a programação.");
  }
  return { session, currentUser };
}

export async function createProgramacao(state: ProgramacaoFormState, formData: FormData) {
  const { session, currentUser } = await exigirGerenciarProgramacao();
  if (!podeGerenciarLinks(currentUser)) {
    return { message: "Você não tem permissão para publicar na programação." };
  }

  const validatedFields = ProgramacaoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    conteudo: formData.get("conteudo"),
    dataEvento: formData.get("dataEvento"),
    local: formData.get("local"),
    link: formData.get("link"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, conteudo, dataEvento, local, link } = validatedFields.data;

  const capaFile = formData.get("capa");
  let capaUrl: string | null = null;
  if (isUploadableFile(capaFile) && capaFile.size > 0) {
    try {
      capaUrl = await uploadLinkCapa(capaFile, session.userId);
    } catch (error) {
      return { message: error instanceof Error ? error.message : "Falha ao enviar a foto." };
    }
  }

  await prisma.programacao.create({
    data: {
      titulo: titulo || null,
      conteudo,
      dataEvento: dataEvento ? new Date(dataEvento) : null,
      local: local || null,
      link: link || null,
      capaUrl,
      autorId: session.userId,
    },
  });

  revalidatePath("/novidades/programacao");

  const destinatarios = await prisma.user.findMany({
    where: { id: { not: session.userId } },
    select: { id: true },
  });

  await sendPushToUsers(
    destinatarios.map((u) => u.id),
    {
      title: titulo ? `Nova programação: ${titulo}` : "Nova programação",
      body: conteudo,
      url: "/novidades/programacao",
    }
  );

  return { message: "success" };
}

export async function deleteProgramacao(id: string) {
  await exigirGerenciarProgramacao();

  await prisma.programacao.delete({ where: { id } });
  revalidatePath("/novidades/programacao");
}
