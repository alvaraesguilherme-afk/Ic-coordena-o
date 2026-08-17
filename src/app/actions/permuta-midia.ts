"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { pessoaIndisponivel } from "@/lib/disponibilidade";
import { AREA_MIDIA_LABEL } from "@/lib/areas-midia";
import { AREA_PARA_FUNCAO } from "@/lib/funcoes-midia";
import { sendPushToUsers } from "@/lib/push";

export async function abrirPermuta(entradaId: string): Promise<{ message?: string }> {
  const session = await verifySession();

  const entrada = await prisma.escalaMidiaEntrada.findUnique({
    where: { id: entradaId },
    select: { id: true, area: true, data: true, escaladoId: true },
  });
  if (!entrada) {
    return { message: "Compromisso não encontrado." };
  }
  if (entrada.escaladoId !== session.userId) {
    return { message: "Só quem está escalado pode pedir permuta desse compromisso." };
  }

  const jaAberta = await prisma.permutaMidia.findFirst({
    where: { entradaId, status: "ABERTA" },
    select: { id: true },
  });
  if (jaAberta) {
    return { message: "Já existe um pedido de permuta em aberto pra esse compromisso." };
  }

  await prisma.permutaMidia.create({
    data: { entradaId, solicitanteId: session.userId },
  });

  const funcao = AREA_PARA_FUNCAO[entrada.area];
  const candidatos = await prisma.user.findMany({
    where: {
      id: { not: session.userId },
      servoMidiaStatus: "APROVADO",
      areasServoMidia: { some: { area: funcao, nivel: "VETERANO" } },
    },
    select: { id: true },
  });

  const solicitante = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true },
  });

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(entrada.data);

  await sendPushToUsers(
    candidatos.map((c) => c.id),
    {
      title: `Permuta na ${AREA_MIDIA_LABEL[entrada.area]}`,
      body: `${solicitante.name} está precisando fazer uma permuta para o dia ${dataFormatada}`,
      url: `/escalas/midia?mes=${entrada.data.toISOString().slice(0, 7)}`,
    },
  );

  revalidatePath("/escalas/midia");
  return {};
}

export async function cancelarPermuta(permutaId: string): Promise<{ message?: string }> {
  const session = await verifySession();

  const permuta = await prisma.permutaMidia.findUnique({
    where: { id: permutaId },
    select: { solicitanteId: true, status: true },
  });
  if (!permuta) {
    return { message: "Pedido não encontrado." };
  }
  if (permuta.solicitanteId !== session.userId) {
    return { message: "Só quem abriu o pedido pode cancelar." };
  }
  if (permuta.status !== "ABERTA") {
    return { message: "Esse pedido já foi respondido." };
  }

  await prisma.permutaMidia.update({
    where: { id: permutaId },
    data: { status: "CANCELADA", respondidoEm: new Date() },
  });

  revalidatePath("/escalas/midia");
  return {};
}

export async function aceitarPermuta(permutaId: string): Promise<{ message?: string }> {
  const session = await verifySession();

  const permuta = await prisma.permutaMidia.findUnique({
    where: { id: permutaId },
    include: {
      entrada: { select: { id: true, area: true, data: true, treinandoId: true } },
      solicitante: { select: { id: true, name: true } },
    },
  });
  if (!permuta) {
    return { message: "Pedido não encontrado." };
  }
  if (permuta.status !== "ABERTA") {
    return { message: "Esse pedido já foi respondido por outra pessoa." };
  }
  if (permuta.solicitanteId === session.userId) {
    return { message: "Você não pode aceitar sua própria permuta." };
  }

  const funcao = AREA_PARA_FUNCAO[permuta.entrada.area];
  const aceitante = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true, servoMidiaStatus: true, areasServoMidia: { select: { area: true, nivel: true } } },
  });

  if (aceitante.servoMidiaStatus !== "APROVADO") {
    return { message: "Só servos de mídia aprovados podem aceitar permutas." };
  }
  if (!aceitante.areasServoMidia.some((a) => a.area === funcao && a.nivel === "VETERANO")) {
    return { message: `Você não é veterano em ${AREA_MIDIA_LABEL[permuta.entrada.area]}.` };
  }
  if (
    await pessoaIndisponivel(session.userId, permuta.entrada.data, {
      excludeMidiaEntradaId: permuta.entrada.id,
    })
  ) {
    return { message: "Você já está escalado em outro compromisso nesse dia." };
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const atualizadas = await tx.permutaMidia.updateMany({
      where: { id: permutaId, status: "ABERTA" },
      data: { status: "ACEITA", aceitoPorId: session.userId, respondidoEm: new Date() },
    });
    if (atualizadas.count === 0) {
      return false;
    }

    await tx.escalaMidiaEntrada.update({
      where: { id: permuta.entrada.id },
      data: {
        escaladoId: session.userId,
        ...(permuta.entrada.treinandoId === session.userId && { treinandoId: null }),
      },
    });

    return true;
  });

  if (!resultado) {
    return { message: "Esse pedido já foi respondido por outra pessoa." };
  }

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(permuta.entrada.data);

  await sendPushToUsers([permuta.solicitanteId], {
    title: "Sua permuta foi aceita",
    body: `${aceitante.name} assumiu seu lugar na ${AREA_MIDIA_LABEL[permuta.entrada.area]} do dia ${dataFormatada}`,
    url: `/escalas/midia?mes=${permuta.entrada.data.toISOString().slice(0, 7)}`,
  });

  revalidatePath("/escalas/midia");
  return {};
}
