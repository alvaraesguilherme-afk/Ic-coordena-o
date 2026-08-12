"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { pessoaIndisponivel } from "@/lib/disponibilidade";
import { AREAS_MIDIA, AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";
import { sendPushToUsers } from "@/lib/push";
import { mesLabel } from "@/lib/sabados";

export type EscalaMidiaFormState =
  | {
      message?: string;
    }
  | undefined;

async function exigirSupervisor() {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, supervisorMidia: true },
  });
  if (!currentUser.isAdmin && !currentUser.supervisorMidia) {
    throw new Error("Apenas o supervisor de mídia pode montar a grade.");
  }
}

export async function salvarEscalaMidia(
  state: EscalaMidiaFormState,
  formData: FormData,
): Promise<EscalaMidiaFormState> {
  await exigirSupervisor();

  const area = formData.get("area") as AreaMidia;
  const dataStr = formData.get("data") as string;
  const escaladoId = formData.get("escaladoId") as string;
  const treinandoId = (formData.get("treinandoId") as string) || null;

  if (!AREAS_MIDIA.includes(area) || !dataStr || !escaladoId) {
    return { message: "Dados inválidos." };
  }

  if (treinandoId && treinandoId === escaladoId) {
    return { message: "O treinamento não pode ser a mesma pessoa do escalado." };
  }

  const data = new Date(`${dataStr}T00:00:00.000Z`);

  const escalado = await prisma.user.findUnique({
    where: { id: escaladoId },
    select: { servoMidiaStatus: true },
  });
  if (escalado?.servoMidiaStatus !== "APROVADO") {
    return { message: "Só servos de mídia aprovados podem ser escalados." };
  }

  const existente = await prisma.escalaMidiaEntrada.findUnique({
    where: { area_data: { area, data } },
    select: { id: true },
  });

  if (await pessoaIndisponivel(escaladoId, data, { excludeMidiaEntradaId: existente?.id })) {
    return { message: "Essa pessoa já está escalada em outro compromisso nesse dia." };
  }

  if (treinandoId && (await pessoaIndisponivel(treinandoId, data, { excludeMidiaEntradaId: existente?.id }))) {
    return { message: "Essa pessoa (treinamento) já está escalada em outro compromisso nesse dia." };
  }

  await prisma.escalaMidiaEntrada.upsert({
    where: { area_data: { area, data } },
    update: { escaladoId, treinandoId },
    create: { area, data, escaladoId, treinandoId },
  });

  revalidatePath("/escalas/midia");
  redirect(`/escalas/midia?mes=${dataStr.slice(0, 7)}`);
}

export async function removerEscalaMidia(id: string) {
  await exigirSupervisor();

  const entrada = await prisma.escalaMidiaEntrada.delete({ where: { id } });
  revalidatePath("/escalas/midia");
  return entrada;
}

export async function concluirGradeMidia(ano: number, mes: number) {
  await exigirSupervisor();

  const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const entradas = await prisma.escalaMidiaEntrada.findMany({
    where: { data: { gte: inicioMes, lt: fimMes } },
    select: { area: true, data: true, escaladoId: true, treinandoId: true },
  });

  if (entradas.length === 0) {
    return { message: "Essa grade ainda não tem ninguém escalado." };
  }

  const formatarData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  const linhasPorUsuario = new Map<string, string[]>();

  for (const entrada of entradas) {
    const linha = `${AREA_MIDIA_LABEL[entrada.area]} (${formatarData.format(entrada.data)})`;

    linhasPorUsuario.set(entrada.escaladoId, [...(linhasPorUsuario.get(entrada.escaladoId) ?? []), linha]);

    if (entrada.treinandoId) {
      linhasPorUsuario.set(entrada.treinandoId, [
        ...(linhasPorUsuario.get(entrada.treinandoId) ?? []),
        `${linha} · treinamento`,
      ]);
    }
  }

  const mesFormatado = mesLabel(ano, mes);
  const mesParam = `${ano}-${String(mes).padStart(2, "0")}`;

  await Promise.all(
    [...linhasPorUsuario.entries()].map(([userId, linhas]) =>
      sendPushToUsers([userId], {
        title: `Grade de mídia de ${mesFormatado}`,
        body: linhas.join(" · "),
        url: `/escalas/midia?mes=${mesParam}`,
      }),
    ),
  );

  return { message: "success", total: linhasPorUsuario.size };
}
