"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { encontroTravado, formatDataFalta } from "@/lib/frequencia";
import { sendPushToUsers } from "@/lib/push";

async function exigirLiderDaIc(igrejaId: string) {
  const session = await verifySession();
  const [currentUser, igreja] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { isAdmin: true } }),
    prisma.igrejaCasa.findUniqueOrThrow({
      where: { id: igrejaId },
      select: { nome: true, liderId: true, redeId: true },
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
  if (encontroTravado(data)) {
    return { message: "Esse dia já passou e a frequência está travada." };
  }
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

// Encontro remarcado pra outro dia dessa semana (ex: não deu na quinta, fez
// na sexta) — avisa todo mundo da IC por push, já que ninguém vai adivinhar
// sozinho que o dia mudou.
export async function remarcarEncontro(
  igrejaId: string,
  novaDataStr: string,
): Promise<{ message?: string; sucesso?: boolean }> {
  if (!igrejaId || !/^\d{4}-\d{2}-\d{2}$/.test(novaDataStr)) {
    return { message: "Data inválida." };
  }

  const session = await verifySession();
  const igreja = await exigirLiderDaIc(igrejaId);

  const novaData = new Date(`${novaDataStr}T00:00:00.000Z`);
  if (encontroTravado(novaData)) {
    return { message: "Essa data já passou." };
  }

  const membros = await prisma.user.findMany({
    where: { igrejaId, id: { not: session.userId } },
    select: { id: true },
  });

  await sendPushToUsers(
    membros.map((m) => m.id),
    {
      title: "Reunião remarcada",
      body: `${igreja.nome} mudou o dia da reunião dessa semana pra ${formatDataFalta(novaData)}.`,
      url: `/redes/${igreja.redeId}/igrejas/${igrejaId}/frequencia?data=${novaDataStr}`,
    }
  );

  revalidatePath(`/redes/${igreja.redeId}/igrejas/${igrejaId}/frequencia`);
  return { sucesso: true };
}

export async function finalizarFrequencia(
  igrejaId: string,
  dataStr: string,
): Promise<{ message?: string }> {
  if (!igrejaId || !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    return { message: "Dados inválidos." };
  }

  const session = await verifySession();
  const igreja = await exigirLiderDaIc(igrejaId);

  const data = new Date(`${dataStr}T00:00:00.000Z`);
  if (encontroTravado(data)) {
    return { message: "Esse dia já passou e a frequência está travada." };
  }

  await prisma.reuniao.upsert({
    where: { igrejaId_data: { igrejaId, data } },
    update: { finalizadaEm: new Date() },
    create: { igrejaId, data, finalizadaEm: new Date() },
  });

  revalidatePath(`/redes/${igreja.redeId}/igrejas/${igrejaId}/frequencia`);

  const admins = await prisma.user.findMany({
    where: { isAdmin: true, id: { not: session.userId } },
    select: { id: true },
  });
  await sendPushToUsers(
    admins.map((a) => a.id),
    {
      title: "Frequência enviada",
      body: `${igreja.nome} finalizou a frequência de hoje.`,
      url: `/redes/${igreja.redeId}/igrejas/${igrejaId}/frequencia`,
    }
  );

  return { message: "success" };
}
