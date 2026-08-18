"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { RedeFormSchema, type RedeFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createRede(state: RedeFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder pode cadastrar uma rede." };
  }

  const validatedFields = RedeFormSchema.safeParse({
    nome: formData.get("nome"),
    liderNome: formData.get("liderNome"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, liderNome } = validatedFields.data;

  await prisma.rede.create({
    data: { nome, liderNome: liderNome || null },
  });

  updateTag("redes-list");
  updateTag("membros-list");
  revalidatePath("/inicio");
  revalidatePath("/redes");
  redirect("/redes");
}

export async function deleteRede(id: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover uma rede.");
  }

  await prisma.rede.delete({ where: { id } });
  updateTag("redes-list");
  updateTag("membros-list");
  revalidatePath("/inicio");
  revalidatePath("/redes");
}
