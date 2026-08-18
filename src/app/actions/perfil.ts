"use server";

import { revalidatePath, updateTag } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EditPerfilFormSchema, type EditPerfilFormState } from "@/lib/definitions";
import { isUploadableFile, uploadAvatar } from "@/lib/storage";
import { capitalizarNome } from "@/lib/user";

export async function setNotificacoes(ativo: boolean) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.userId },
    data: { notificacoes: ativo },
  });

  revalidatePath("/configuracoes");
}

export async function updatePerfil(state: EditPerfilFormState, formData: FormData) {
  const session = await verifySession();

  const validatedFields = EditPerfilFormSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name } = validatedFields.data;

  let avatarUrl: string | undefined;
  const avatarFile = formData.get("avatar");
  if (isUploadableFile(avatarFile) && avatarFile.size > 0) {
    try {
      avatarUrl = await uploadAvatar(avatarFile, session.userId);
    } catch (error) {
      return { message: error instanceof Error ? error.message : "Falha ao enviar a foto." };
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { name: capitalizarNome(name), ...(avatarUrl && { avatarUrl }) },
  });

  updateTag("membros-list");
  revalidatePath("/perfil");
  revalidatePath("/membros");
  revalidatePath("/inicio");

  return { success: true };
}
