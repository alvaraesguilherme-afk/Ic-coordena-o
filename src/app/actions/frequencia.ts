"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

async function exigirLiderDaIc(igrejaId: string) {
  const session = await verifySession();
  const [currentUser, igreja] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { isAdmin: true } }),
    prisma.igrejaCasa.findUniqueOrThrow({
      where: { id: igrejaId },
      select: { liderId: true, redeId: true },
    }),
  ]);
  if (!currentUser.isAdmin && session.userId !== igreja.liderId) {
    throw new Error("Você não é líder dessa IC.");
  }
  return igreja;
}

export async function marcarPresenca(
  igrejaId: string,
  dataStr: string,
  membroId: string,
  presente: boolean,
  motivo?: string,
): Promise<{ message?: string }> {
  if (!igrejaId || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr) || !membroId) {
    return { message: "Dados inválidos." };
  }

  const igreja = await exigirLiderDaIc(igrejaId);

  const membro = await prisma.user.findFirst({
    where: { id: membroId, igrejaId },
    select: { id: true },
  });
  if (!membro) {
    return { message: "Esse membro não pertence a essa IC." };
  }

  const data = new Date(`${dataStr}T00:00:00.000Z`);
  const motivoFinal = presente ? null : motivo?.trim() || null;

  const reuniao = await prisma.reuniao.upsert({
    where: { igrejaId_data: { igrejaId, data } },
    update: {},
    create: { igrejaId, data },
  });

  await prisma.presenca.upsert({
    where: { reuniaoId_userId: { reuniaoId: reuniao.id, userId: membroId } },
    update: { presente, motivo: motivoFinal },
    create: { reuniaoId: reuniao.id, userId: membroId, presente, motivo: motivoFinal },
  });

  revalidatePath(`/redes/${igreja.redeId}/igrejas/${igrejaId}/frequencia`);
  revalidatePath("/frequencia");
  revalidatePath("/faltas");
  return {};
}
