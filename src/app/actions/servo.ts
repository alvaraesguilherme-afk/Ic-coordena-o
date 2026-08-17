"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { FUNCOES_MIDIA, type FuncaoMidia } from "@/lib/funcoes-midia";

const DIAS_ESPERA_APOS_RECUSA = 30;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

function diasParaLiberarNovoPedido(recusadoEm: Date, agora: Date = new Date()) {
  const liberaEm = recusadoEm.getTime() + DIAS_ESPERA_APOS_RECUSA * MS_POR_DIA;
  return Math.max(0, Math.ceil((liberaEm - agora.getTime()) / MS_POR_DIA));
}

export async function solicitarServoMidia(area: FuncaoMidia): Promise<{ message?: string }> {
  const session = await verifySession();

  if (!FUNCOES_MIDIA.includes(area)) {
    throw new Error("Função inválida.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { servoMidiaStatus: true, servoMidiaRecusadoEm: true },
  });

  if (user.servoMidiaStatus !== "NENHUM") {
    return {};
  }

  if (user.servoMidiaRecusadoEm) {
    const dias = diasParaLiberarNovoPedido(user.servoMidiaRecusadoEm);
    if (dias > 0) {
      return { message: `Seu pedido foi negado. Você pode pedir de novo em ${dias} dia${dias === 1 ? "" : "s"}.` };
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      servoMidiaStatus: "PENDENTE",
      areaSolicitadaMidia: area,
      servoMidiaSolicitadoEm: new Date(),
      servoMidiaRecusadoEm: null,
    },
  });

  revalidatePath("/configuracoes");
  return {};
}

async function podeAprovar(currentUserId: string, candidatoId: string) {
  const [currentUser, candidato] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: currentUserId },
      select: { isAdmin: true, redeId: true },
    }),
    prisma.user.findUnique({
      where: { id: candidatoId },
      select: { redeId: true, igreja: { select: { redeId: true } } },
    }),
  ]);

  if (!candidato) return false;
  if (currentUser.isAdmin) return true;

  const candidatoRedeId = candidato.igreja?.redeId ?? candidato.redeId;
  return currentUser.redeId !== null && currentUser.redeId === candidatoRedeId;
}

async function exigirSupervisorMidia() {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, supervisorMidia: true },
  });
  if (!currentUser.isAdmin && !currentUser.supervisorMidia) {
    throw new Error("Apenas o supervisor de mídia pode gerenciar a equipe.");
  }
}

export async function aprovarServoMidia(userId: string) {
  await exigirSupervisorMidia();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { areaSolicitadaMidia: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { servoMidiaStatus: "APROVADO", servoMidiaSolicitadoEm: null, areaSolicitadaMidia: null },
  });

  if (user.areaSolicitadaMidia) {
    await prisma.areaMidiaServo.upsert({
      where: { userId_area: { userId, area: user.areaSolicitadaMidia } },
      update: {},
      create: { userId, area: user.areaSolicitadaMidia, nivel: "TREINEIRO" },
    });
  }

  revalidatePath("/escalas/midia");
}

export async function recusarServoMidia(userId: string) {
  await exigirSupervisorMidia();

  await prisma.user.update({
    where: { id: userId },
    data: {
      servoMidiaStatus: "NENHUM",
      areaSolicitadaMidia: null,
      supervisorMidia: false,
      servoMidiaSolicitadoEm: null,
      servoMidiaRecusadoEm: new Date(),
    },
  });

  revalidatePath("/escalas/midia");
}

export async function promoverSupervisorMidia(userId: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode tornar alguém supervisor de mídia.");
  }

  if (!(await podeAprovar(session.userId, userId))) {
    throw new Error("Você só pode gerenciar pessoas da sua própria rede.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { supervisorMidia: true },
  });

  revalidatePath("/escalas");
}

export async function removerSupervisorMidia(userId: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover um supervisor de mídia.");
  }

  if (!(await podeAprovar(session.userId, userId))) {
    throw new Error("Você só pode gerenciar pessoas da sua própria rede.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { supervisorMidia: false },
  });

  revalidatePath("/escalas");
}

export async function adicionarAreaMidia(userId: string, area: FuncaoMidia) {
  await exigirSupervisorMidia();

  if (!FUNCOES_MIDIA.includes(area)) {
    throw new Error("Função inválida.");
  }

  await prisma.areaMidiaServo.upsert({
    where: { userId_area: { userId, area } },
    update: {},
    create: { userId, area, nivel: "TREINEIRO" },
  });

  revalidatePath("/escalas/midia");
}

export async function removerAreaMidia(userId: string, area: FuncaoMidia) {
  await exigirSupervisorMidia();

  await prisma.areaMidiaServo.deleteMany({ where: { userId, area } });

  revalidatePath("/escalas/midia");
}

export async function alterarNivelAreaMidia(userId: string, area: FuncaoMidia) {
  await exigirSupervisorMidia();

  const atual = await prisma.areaMidiaServo.findUnique({
    where: { userId_area: { userId, area } },
  });
  if (!atual) return;

  await prisma.areaMidiaServo.update({
    where: { id: atual.id },
    data: { nivel: atual.nivel === "VETERANO" ? "TREINEIRO" : "VETERANO" },
  });

  revalidatePath("/escalas/midia");
}

export async function removerServoMidia(userId: string) {
  await exigirSupervisorMidia();

  await prisma.$transaction([
    prisma.areaMidiaServo.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: {
        servoMidiaStatus: "NENHUM",
        areaSolicitadaMidia: null,
        supervisorMidia: false,
        servoMidiaSolicitadoEm: null,
      },
    }),
  ]);

  revalidatePath("/escalas");
  revalidatePath("/escalas/midia");
}
