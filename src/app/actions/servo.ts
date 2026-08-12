"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AREAS_MIDIA, type AreaMidia } from "@/lib/areas-midia";

export async function solicitarServoMidia(area: AreaMidia) {
  const session = await verifySession();

  if (!AREAS_MIDIA.includes(area)) {
    throw new Error("Área inválida.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { servoMidiaStatus: true },
  });

  if (user.servoMidiaStatus !== "NENHUM") {
    return;
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { servoMidiaStatus: "PENDENTE", areasMidia: [area], servoMidiaSolicitadoEm: new Date() },
  });

  revalidatePath("/configuracoes");
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

export async function aprovarServoMidia(userId: string) {
  await exigirSupervisorMidia();

  await prisma.user.update({
    where: { id: userId },
    data: { servoMidiaStatus: "APROVADO", servoMidiaSolicitadoEm: null },
  });

  revalidatePath("/escalas/midia");
}

export async function recusarServoMidia(userId: string) {
  await exigirSupervisorMidia();

  await prisma.user.update({
    where: { id: userId },
    data: {
      servoMidiaStatus: "NENHUM",
      areasMidia: [],
      supervisorMidia: false,
      servoMidiaSolicitadoEm: null,
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

export async function promoverVeteranoMidia(userId: string) {
  await exigirSupervisorMidia();

  await prisma.user.update({
    where: { id: userId },
    data: { veteranoMidia: true },
  });

  revalidatePath("/escalas/midia");
}

export async function adicionarAreaMidia(userId: string, area: AreaMidia) {
  await exigirSupervisorMidia();

  if (!AREAS_MIDIA.includes(area)) {
    throw new Error("Área inválida.");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { areasMidia: true },
  });
  if (user.areasMidia.includes(area)) return;

  await prisma.user.update({
    where: { id: userId },
    data: { areasMidia: { push: area } },
  });

  revalidatePath("/escalas/midia");
}

export async function removerAreaMidia(userId: string, area: AreaMidia) {
  await exigirSupervisorMidia();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { areasMidia: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { areasMidia: user.areasMidia.filter((a) => a !== area) },
  });

  revalidatePath("/escalas/midia");
}

export async function removerServoMidia(userId: string) {
  await exigirSupervisorMidia();

  await prisma.user.update({
    where: { id: userId },
    data: {
      servoMidiaStatus: "NENHUM",
      areasMidia: [],
      supervisorMidia: false,
      veteranoMidia: false,
      servoMidiaSolicitadoEm: null,
    },
  });

  revalidatePath("/escalas");
  revalidatePath("/escalas/midia");
}
