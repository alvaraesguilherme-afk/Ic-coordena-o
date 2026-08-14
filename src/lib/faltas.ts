import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function resolverEscopoFaltas(currentUser: {
  id: string;
  isAdmin: boolean;
  redeId: string | null;
}): Promise<{ where: Prisma.PresencaWhereInput } | null> {
  if (currentUser.isAdmin) {
    return { where: {} };
  }

  if (currentUser.redeId) {
    return { where: { reuniao: { igreja: { redeId: currentUser.redeId } } } };
  }

  const ics = await prisma.igrejaCasa.findMany({
    where: { liderId: currentUser.id },
    select: { id: true },
  });
  if (ics.length === 0) {
    return null;
  }

  return { where: { reuniao: { igreja: { id: { in: ics.map((ic) => ic.id) } } } } };
}
