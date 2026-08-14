"use server";

import { revalidatePath } from "next/cache";
import { LinkFormSchema, type LinkFormState } from "@/lib/definitions";
import { podeGerenciarLinks, SLUG_POR_CATEGORIA_LINK } from "@/lib/links";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

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

  const { titulo, url, categoria } = validatedFields.data;

  await prisma.linkUtil.create({
    data: { titulo, url, categoria, autorId: session.userId },
  });

  revalidatePath(`/links/${SLUG_POR_CATEGORIA_LINK[categoria]}`);
  return { message: "success" };
}

export async function deleteLink(id: string) {
  await exigirGerenciarLinks();

  const link = await prisma.linkUtil.delete({ where: { id } });
  revalidatePath(`/links/${SLUG_POR_CATEGORIA_LINK[link.categoria]}`);
}
