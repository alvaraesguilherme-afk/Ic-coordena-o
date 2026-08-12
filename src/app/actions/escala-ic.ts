"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { campoSupervisorIc, SLUG_POR_TIPO_IC, TIPOS_ESCALA_IC, VAGAS_IC, type TipoEscalaIc } from "@/lib/escalas";

async function exigirSupervisorIc(tipo: TipoEscalaIc) {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, supervisorIntegracao: true, supervisorIntercessao: true },
  });
  if (!currentUser.isAdmin && !currentUser[campoSupervisorIc(tipo)]) {
    throw new Error("Você não é supervisor dessa escala.");
  }
}

export async function salvarEscalaIc(
  tipo: TipoEscalaIc,
  dataStr: string,
  vaga: number,
  liderId: string,
): Promise<{ message?: string }> {
  if (!TIPOS_ESCALA_IC.includes(tipo) || !dataStr || !(VAGAS_IC as readonly number[]).includes(vaga) || !liderId) {
    return { message: "Dados inválidos." };
  }

  await exigirSupervisorIc(tipo);

  const data = new Date(`${dataStr}T00:00:00.000Z`);
  const outraVaga = vaga === 1 ? 2 : 1;

  const conflito = await prisma.escalaIcEntrada.findUnique({
    where: { tipo_data_vaga: { tipo, data, vaga: outraVaga } },
    select: { liderId: true },
  });
  if (conflito?.liderId === liderId) {
    return { message: "Essa IC já está escalada na outra vaga desse dia." };
  }

  await prisma.escalaIcEntrada.upsert({
    where: { tipo_data_vaga: { tipo, data, vaga } },
    update: { liderId },
    create: { tipo, data, vaga, liderId },
  });

  revalidatePath(`/escalas/${SLUG_POR_TIPO_IC[tipo]}`);
  return {};
}

export async function removerEscalaIc(id: string, tipo: TipoEscalaIc) {
  await exigirSupervisorIc(tipo);

  await prisma.escalaIcEntrada.delete({ where: { id } });
  revalidatePath(`/escalas/${SLUG_POR_TIPO_IC[tipo]}`);
}

export async function promoverSupervisorIc(userId: string, tipo: TipoEscalaIc) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode gerenciar supervisores.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { [campoSupervisorIc(tipo)]: true },
  });

  revalidatePath("/escalas");
}

export async function removerSupervisorIc(userId: string, tipo: TipoEscalaIc) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode gerenciar supervisores.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { [campoSupervisorIc(tipo)]: false },
  });

  revalidatePath("/escalas");
}
