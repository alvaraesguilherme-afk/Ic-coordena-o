import "server-only";
import { prisma } from "@/lib/prisma";

function diaUtc(data: Date) {
  const inicio = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
  const fim = new Date(inicio);
  fim.setUTCDate(fim.getUTCDate() + 1);
  return { inicio, fim };
}

// Uma pessoa só pode estar em um compromisso (de qualquer tipo de escala) por data.
// Quem cria primeiro tem vantagem: a segunda tentativa é rejeitada.
export async function pessoaIndisponivel(
  userId: string,
  data: Date,
  opts?: { excludeMidiaEntradaId?: string },
) {
  const { inicio, fim } = diaUtc(data);

  const [emEscala, emGradeMidia] = await Promise.all([
    prisma.escalaParticipante.findFirst({
      where: { userId, escala: { data: { gte: inicio, lt: fim } } },
    }),
    prisma.escalaMidiaEntrada.findFirst({
      where: {
        data: { gte: inicio, lt: fim },
        OR: [{ escaladoId: userId }, { treinandoId: userId }],
        ...(opts?.excludeMidiaEntradaId && { NOT: { id: opts.excludeMidiaEntradaId } }),
      },
    }),
  ]);

  return Boolean(emEscala || emGradeMidia);
}
