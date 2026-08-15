"use server";

import { revalidatePath } from "next/cache";
import { LinkFormSchema, type LinkFormState } from "@/lib/definitions";
import { podeGerenciarLinks, SLUG_POR_CATEGORIA_LINK } from "@/lib/links";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isUploadableFile, uploadLinkCapa } from "@/lib/storage";

async function exigirGerenciarLinks() {
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
    throw new Error("Você não tem permissão para gerenciar links.");
  }
  return session;
}

export async function createLink(state: LinkFormState, formData: FormData) {
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
    return { message: "Você não tem permissão para adicionar links." };
  }

  const validatedFields = LinkFormSchema.safeParse({
    titulo: formData.get("titulo"),
    url: formData.get("url"),
    categoria: formData.get("categoria"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const capaFile = formData.get("capa");
  if (!isUploadableFile(capaFile) || capaFile.size === 0) {
    return { errors: { capa: ["Escolha uma foto de capa."] } };
  }

  const { titulo, url, categoria } = validatedFields.data;

  let capaUrl: string;
  try {
    capaUrl = await uploadLinkCapa(capaFile, session.userId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Falha ao enviar a foto." };
  }

  await prisma.linkUtil.create({
    data: { titulo, url, categoria, capaUrl, autorId: session.userId },
  });

  revalidatePath("/novidades");
  revalidatePath(`/links/${SLUG_POR_CATEGORIA_LINK[categoria]}`);
  return { message: "success" };
}

export async function deleteLink(id: string) {
  await exigirGerenciarLinks();

  const link = await prisma.linkUtil.delete({ where: { id } });
  revalidatePath("/novidades");
  revalidatePath(`/links/${SLUG_POR_CATEGORIA_LINK[link.categoria]}`);
}
