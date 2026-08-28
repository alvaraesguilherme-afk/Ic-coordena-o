"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { RedeFormSchema, type RedeFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createRede(state: RedeFormState, formData: FormData) {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, role: true },
  });
  if (!currentUser.isAdmin && currentUser.role !== "PASTOR") {
    return { message: "Apenas o administrador ou o pastor podem cadastrar uma rede." };
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
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, role: true },
  });
  if (!currentUser.isAdmin && currentUser.role !== "PASTOR") {
    throw new Error("Apenas o administrador ou o pastor podem remover uma rede.");
  }

  await prisma.rede.delete({ where: { id } });
  updateTag("redes-list");
  updateTag("membros-list");
  revalidatePath("/inicio");
  revalidatePath("/redes");
}
