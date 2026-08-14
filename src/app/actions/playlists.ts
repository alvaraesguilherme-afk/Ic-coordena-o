"use server";

import { revalidatePath } from "next/cache";
import { PlaylistFormSchema, type PlaylistFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isUploadableFile, uploadPlaylistCapa } from "@/lib/storage";

export async function createPlaylist(
  state: PlaylistFormState,
  formData: FormData
): Promise<PlaylistFormState> {
  const session = await verifySession();

  const validatedFields = PlaylistFormSchema.safeParse({
    titulo: formData.get("titulo"),
    url: formData.get("url"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const capaFile = formData.get("capa");
  if (!isUploadableFile(capaFile) || capaFile.size === 0) {
    return { errors: { capa: ["Escolha uma foto de capa."] } };
  }

  const { titulo, url } = validatedFields.data;

  let capaUrl: string;
  try {
    capaUrl = await uploadPlaylistCapa(capaFile, session.userId);
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Falha ao enviar a foto." };
  }

  await prisma.playlist.create({
    data: { titulo, url, capaUrl, autorId: session.userId },
  });

  revalidatePath("/novidades");
  return { message: "success" };
}

export async function deletePlaylist(id: string) {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { role: true },
  });

  const playlist = await prisma.playlist.findUniqueOrThrow({ where: { id } });

  if (playlist.autorId !== session.userId && currentUser.role !== "LIDER") {
    throw new Error("Você não tem permissão para remover essa playlist.");
  }

  await prisma.playlist.delete({ where: { id } });
  revalidatePath("/novidades");
}
