"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function deleteMembro(id: string, redeId: string, igrejaId: string) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    throw new Error("Apenas o líder pode remover membros.");
  }
  if (session.userId === id) {
    throw new Error("Você não pode remover sua própria conta.");
  }

  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { isAdmin: true, redeId: true },
  });

  if (!currentUser.isAdmin && currentUser.redeId !== redeId) {
    throw new Error("Você só pode remover membros da sua própria rede.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath(`/redes/${redeId}/igrejas/${igrejaId}`);
}
