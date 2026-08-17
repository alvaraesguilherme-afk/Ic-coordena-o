"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

async function exigirSupervisor() {
  const session = await verifySession();
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, supervisorMidia: true },
  });
  if (!currentUser.isAdmin && !currentUser.supervisorMidia) {
    throw new Error("Apenas o supervisor de mídia pode marcar presença.");
  }
}

export async function marcarPresencaMidia(
  entradaId: string,
  papel: "escalado" | "treinando",
  presente: boolean,
  motivo?: string,
): Promise<{ message?: string }> {
  await exigirSupervisor();

  const entrada = await prisma.escalaMidiaEntrada.findUnique({
    where: { id: entradaId },
    select: { treinandoId: true },
  });
  if (!entrada) {
    return { message: "Compromisso não encontrado." };
  }
  if (papel === "treinando" && !entrada.treinandoId) {
    return { message: "Esse compromisso não tem treinando." };
  }

  const motivoFinal = presente ? null : motivo?.trim() || null;

  await prisma.escalaMidiaEntrada.update({
    where: { id: entradaId },
    data:
      papel === "escalado"
        ? { escaladoPresente: presente, escaladoMotivoFalta: motivoFinal }
        : { treinandoPresente: presente, treinandoMotivoFalta: motivoFinal },
  });

  revalidatePath("/escalas/midia");
  return {};
}
