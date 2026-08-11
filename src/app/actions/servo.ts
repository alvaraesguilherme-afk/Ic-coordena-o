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
    data: { servoMidiaStatus: "PENDENTE", areaMidia: area },
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
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode aprovar um servo.");
  }

  if (!(await podeAprovar(session.userId, userId))) {
    throw new Error("Você só pode aprovar pessoas da sua própria rede.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { servoMidiaStatus: "APROVADO" },
  });

  revalidatePath("/escalas");
}

export async function recusarServoMidia(userId: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode recusar um pedido de servo.");
  }

  if (!(await podeAprovar(session.userId, userId))) {
    throw new Error("Você só pode gerenciar pessoas da sua própria rede.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { servoMidiaStatus: "NENHUM", areaMidia: null, supervisorMidia: false },
  });

  revalidatePath("/escalas");
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
