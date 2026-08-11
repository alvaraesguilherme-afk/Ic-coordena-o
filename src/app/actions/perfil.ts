"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function setNotificacoes(ativo: boolean) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.userId },
    data: { notificacoes: ativo },
  });

  revalidatePath("/configuracoes");
}
