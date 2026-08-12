"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventoFormSchema, type EventoFormState } from "@/lib/definitions";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

async function podeGerenciarEventos(redeId: string) {
  const currentUser = await getUser();
  return currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === redeId);
}

export async function createEvento(
  redeId: string,
  state: EventoFormState,
  formData: FormData
): Promise<EventoFormState> {
  if (!(await podeGerenciarEventos(redeId))) {
    return { message: "Você não pode criar eventos nessa rede." };
  }

  const validatedFields = EventoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    data: formData.get("data"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, data } = validatedFields.data;

  await prisma.evento.create({
    data: { titulo, data: new Date(data), redeId },
  });

  revalidatePath(`/redes/${redeId}/eventos`);
  redirect(`/redes/${redeId}/eventos`);
}

export async function deleteEvento(id: string, redeId: string) {
  if (!(await podeGerenciarEventos(redeId))) {
    return;
  }

  await prisma.evento.delete({ where: { id } });
  revalidatePath(`/redes/${redeId}/eventos`);
}
