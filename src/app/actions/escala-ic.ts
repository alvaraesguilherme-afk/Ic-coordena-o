"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";
import { mesLabel } from "@/lib/sabados";
import {
  campoSupervisorIc,
  ESCALA_TIPO_LABEL,
  SLUG_POR_TIPO_IC,
  TIPOS_ESCALA_IC,
  VAGAS_IC,
  type TipoEscalaIc,
} from "@/lib/escalas";

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
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true },
  });
  if (!currentUser.isAdmin) {
    throw new Error("Apenas um administrador pode gerenciar supervisores.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { [campoSupervisorIc(tipo)]: true },
  });

  revalidatePath("/escalas");
}

export async function removerSupervisorIc(userId: string, tipo: TipoEscalaIc) {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true },
  });
  if (!currentUser.isAdmin) {
    throw new Error("Apenas um administrador pode gerenciar supervisores.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { [campoSupervisorIc(tipo)]: false },
  });

  revalidatePath("/escalas");
}

export async function concluirGradeIc(tipo: TipoEscalaIc, ano: number, mes: number) {
  await exigirSupervisorIc(tipo);

  const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const entradas = await prisma.escalaIcEntrada.findMany({
    where: { tipo, data: { gte: inicioMes, lt: fimMes } },
    select: { vaga: true, data: true, liderId: true },
  });

  if (entradas.length === 0) {
    return { message: "Essa grade ainda não tem ninguém escalado." };
  }

  const formatarData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  const linhasPorLider = new Map<string, string[]>();

  for (const entrada of entradas) {
    const linha = `IC ${entrada.vaga} (${formatarData.format(entrada.data)})`;
    linhasPorLider.set(entrada.liderId, [...(linhasPorLider.get(entrada.liderId) ?? []), linha]);
  }

  const mesFormatado = mesLabel(ano, mes);
  const mesParam = `${ano}-${String(mes).padStart(2, "0")}`;
  const slug = SLUG_POR_TIPO_IC[tipo];

  await prisma.gradeIcMes.upsert({
    where: { tipo_ano_mes: { tipo, ano, mes } },
    update: { concluidaEm: new Date() },
    create: { tipo, ano, mes },
  });

  await Promise.all(
    [...linhasPorLider.entries()].map(([liderId, linhas]) =>
      sendPushToUsers([liderId], {
        title: `Escala de ${ESCALA_TIPO_LABEL[tipo]} de ${mesFormatado}`,
        body: linhas.join(" · "),
        url: `/escalas/${slug}?mes=${mesParam}`,
      }),
    ),
  );

  revalidatePath(`/escalas/${slug}`);
  return { message: "success", total: linhasPorLider.size };
}
