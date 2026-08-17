"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";
import { mesLabel } from "@/lib/sabados";

async function exigirSupervisorCulto() {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, supervisorDirecaoCulto: true },
  });
  if (!currentUser.isAdmin && !currentUser.supervisorDirecaoCulto) {
    throw new Error("Apenas o supervisor de Direção de Culto pode gerenciar essa escala.");
  }
}

export async function autorizarDirecaoCulto(userId: string) {
  await exigirSupervisorCulto();

  await prisma.user.update({
    where: { id: userId },
    data: { autorizadoDirecaoCulto: true },
  });

  revalidatePath("/escalas/culto");
}

export async function removerAutorizacaoDirecaoCulto(userId: string) {
  await exigirSupervisorCulto();

  await prisma.user.update({
    where: { id: userId },
    data: { autorizadoDirecaoCulto: false },
  });

  revalidatePath("/escalas/culto");
}

export async function salvarEscalaCulto(dataStr: string, escaladoId: string): Promise<{ message?: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataStr) || !escaladoId) {
    return { message: "Dados inválidos." };
  }

  await exigirSupervisorCulto();

  const escalado = await prisma.user.findUnique({
    where: { id: escaladoId },
    select: { autorizadoDirecaoCulto: true },
  });
  if (!escalado?.autorizadoDirecaoCulto) {
    return { message: "Essa pessoa não está autorizada pra Direção de Culto." };
  }

  const data = new Date(`${dataStr}T00:00:00.000Z`);

  await prisma.escalaCultoEntrada.upsert({
    where: { data },
    update: { escaladoId },
    create: { data, escaladoId },
  });

  revalidatePath("/escalas/culto");
  return {};
}

export async function removerEscalaCulto(id: string) {
  await exigirSupervisorCulto();

  await prisma.escalaCultoEntrada.delete({ where: { id } });
  revalidatePath("/escalas/culto");
}

export async function concluirGradeCulto(ano: number, mes: number) {
  await exigirSupervisorCulto();

  const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const entradas = await prisma.escalaCultoEntrada.findMany({
    where: { data: { gte: inicioMes, lt: fimMes } },
    select: { data: true, escaladoId: true },
  });

  if (entradas.length === 0) {
    return { message: "Essa grade ainda não tem ninguém escalado." };
  }

  const formatarData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  const linhasPorPessoa = new Map<string, string[]>();

  for (const entrada of entradas) {
    const linha = `Direção de Culto (${formatarData.format(entrada.data)})`;
    linhasPorPessoa.set(entrada.escaladoId, [...(linhasPorPessoa.get(entrada.escaladoId) ?? []), linha]);
  }

  const mesFormatado = mesLabel(ano, mes);
  const mesParam = `${ano}-${String(mes).padStart(2, "0")}`;

  await prisma.gradeCultoMes.upsert({
    where: { ano_mes: { ano, mes } },
    update: { concluidaEm: new Date() },
    create: { ano, mes },
  });

  await Promise.all(
    [...linhasPorPessoa.entries()].map(([userId, linhas]) =>
      sendPushToUsers([userId], {
        title: `Direção de Culto de ${mesFormatado}`,
        body: linhas.join(" · "),
        url: `/escalas/culto?mes=${mesParam}`,
      }),
    ),
  );

  revalidatePath("/escalas/culto");
  return { message: "success", total: linhasPorPessoa.size };
}
