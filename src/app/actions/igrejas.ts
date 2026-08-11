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
    liderId: formData.get("liderId"),
    diaSemana: formData.get("diaSemana"),
    horario: formData.get("horario"),
    redeId: formData.get("redeId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { nome, endereco, liderId, diaSemana, horario, redeId } = validatedFields.data;

  const [currentUser, rede, liderEscolhido, icsDaRede] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { redeId: true, isAdmin: true },
    }),
    prisma.rede.findUnique({ where: { id: redeId }, select: { liderNome: true } }),
    prisma.user.findUnique({ where: { id: liderId }, select: { id: true, name: true, role: true, redeId: true } }),
    prisma.igrejaCasa.findMany({ where: { redeId }, select: { liderId: true } }),
  ]);

  if (!currentUser.isAdmin && currentUser.redeId !== redeId) {
    return { message: "Você só pode criar ICs dentro da sua própria rede." };
  }

  const ehLiderDaRede = liderEscolhido?.name === rede?.liderNome;
  const jaLideraOutraIc = icsDaRede.some((i) => i.liderId === liderId);

  if (
    !liderEscolhido ||
    liderEscolhido.role !== "LIDER" ||
    liderEscolhido.redeId !== redeId ||
    (jaLideraOutraIc && !ehLiderDaRede)
  ) {
    return { errors: { liderId: ["Selecione um líder disponível dessa rede."] } };
  }

  const igreja = await prisma.igrejaCasa.create({
    data: {
      nome,
      endereco: endereco || null,
      liderId,
      diaSemana,
      horario,
      redeId,
    },
  });

  await prisma.user.update({
    where: { id: liderId },
    data: { igrejaId: igreja.id },
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
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { redeId: true, isAdmin: true } }),
    prisma.igrejaCasa.findUnique({ where: { id }, select: { redeId: true } }),
  ]);

  if (!igreja || (!currentUser.isAdmin && currentUser.redeId !== igreja.redeId)) {
    throw new Error("Você só pode remover ICs da sua própria rede.");
  }

  await prisma.igrejaCasa.delete({ where: { id } });
  revalidatePath("/inicio");
  revalidatePath(`/redes/${redeId}`);
  redirect(`/redes/${redeId}`);
}
