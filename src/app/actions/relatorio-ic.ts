"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { SLUG_POR_TIPO_IC, TIPOS_ESCALA_IC, type TipoEscalaIc } from "@/lib/escalas";

function inteiroValido(n: number) {
  return Number.isInteger(n) && n >= 0;
}

export async function enviarRelatorioIc(
  tipo: TipoEscalaIc,
  dataStr: string,
  visitantes: number,
  presentes: number,
  novosConvertidos: number,
): Promise<{ message?: string }> {
  if (
    !TIPOS_ESCALA_IC.includes(tipo) ||
    !dataStr ||
    !inteiroValido(visitantes) ||
    !inteiroValido(presentes) ||
    !inteiroValido(novosConvertidos)
  ) {
    return { message: "Preencha os três campos com números válidos." };
  }

  const session = await verifySession();
  const data = new Date(`${dataStr}T00:00:00.000Z`);

  const [currentUser, entradasDoDia] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { isAdmin: true } }),
    prisma.escalaIcEntrada.findMany({ where: { tipo, data }, select: { liderId: true } }),
  ]);

  const escalado = entradasDoDia.some((e) => e.liderId === session.userId);
  if (!currentUser.isAdmin && !escalado) {
    return { message: "Só quem está escalado nesse dia pode enviar o relatório." };
  }

  // Sem update em lugar nenhum de propósito — uma vez criado, o relatório é
  // travado pra sempre (o unique em [tipo, data] também barra reenvio).
  try {
    await prisma.relatorioEscalaIc.create({
      data: { tipo, data, visitantes, presentes, novosConvertidos, enviadoPorId: session.userId },
    });
  } catch {
    return { message: "Esse relatório já foi enviado e não pode ser alterado." };
  }

  revalidatePath(`/escalas/${SLUG_POR_TIPO_IC[tipo]}`);
  return {};
}
