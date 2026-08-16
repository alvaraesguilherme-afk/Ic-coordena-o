"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function marcarTutorialVisto(pagina: string) {
  const session = await verifySession();

  await prisma.user.update({
    where: { id: session.userId },
    data: { tutoriaisVistos: { push: pagina } },
  });
}
