"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function salvarMotivoFalta(
  presencaId: string,
  motivo: string,
): Promise<{ message?: string }> {
  const session = await verifySession();

  const [currentUser, presenca] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId }, select: { isAdmin: true, redeId: true } }),
    prisma.presenca.findUnique({
      where: { id: presencaId },
      select: { reuniao: { select: { igreja: { select: { liderId: true, redeId: true } } } } },
    }),
  ]);

  if (!presenca) {
    return { message: "Falta não encontrada." };
  }

  const igreja = presenca.reuniao.igreja;
  const podeGerenciar =
    currentUser.isAdmin || currentUser.redeId === igreja.redeId || session.userId === igreja.liderId;
  if (!podeGerenciar) {
    return { message: "Você não tem permissão para editar essa falta." };
  }

  await prisma.presenca.update({
    where: { id: presencaId },
    data: { motivo: motivo.trim() || null },
  });

  revalidatePath("/faltas");
  return {};
}
