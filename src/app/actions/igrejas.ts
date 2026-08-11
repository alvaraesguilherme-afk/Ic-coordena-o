"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { IgrejaFormSchema, type IgrejaFormState } from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function createIgreja(state: IgrejaFormState, formData: FormData) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    return { message: "Apenas o líder pode cadastrar uma IC." };
  }

  const validatedFields = IgrejaFormSchema.safeParse({
    nome: formData.get("nome"),
    endereco: formData.get("endereco"),
    liderNome: formData.get("liderNome"),
    diaSemana: formData.get("diaSemana"),
    horario: formData.get("horario"),
    redeId: formData.get("redeId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, endereco, liderNome, diaSemana, horario, redeId } = validatedFields.data;

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { redeId: true },
  });
  if (currentUser.redeId !== redeId) {
    return { message: "Você só pode criar ICs dentro da sua própria rede." };
  }

  const igreja = await prisma.igrejaCasa.create({
    data: {
      nome,
      endereco: endereco || null,
      liderNome,
      diaSemana,
      horario,
      redeId,
    },
  });

  await prisma.user.update({
    where: { id: session.userId },
    data: { igrejaId: igreja.id, redeId },
  });

  revalidatePath("/inicio");
  revalidatePath("/membros");
  revalidatePath("/perfil");
  revalidatePath(`/redes/${redeId}`);
  redirect(`/redes/${redeId}`);
}

export async function deleteIgreja(id: string, redeId: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover uma IC.");
  }

  const [currentUser, igreja] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { redeId: true } }),
    prisma.igrejaCasa.findUnique({ where: { id }, select: { redeId: true } }),
  ]);

  if (!igreja || currentUser.redeId !== igreja.redeId) {
    throw new Error("Você só pode remover ICs da sua própria rede.");
  }

  await prisma.igrejaCasa.delete({ where: { id } });
  revalidatePath("/inicio");
  revalidatePath(`/redes/${redeId}`);
  redirect(`/redes/${redeId}`);
}
