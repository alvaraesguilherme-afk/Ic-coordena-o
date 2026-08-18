import { cacheTag, cacheLife } from "next/cache";
import { prisma } from "@/lib/prisma";

// Consultas compartilhadas por todo mundo (não dependem do usuário logado),
// por isso cabem em cache entre requisições — só refazem a consulta ao banco
// quando alguém realmente muda algo (via updateTag nas actions correspondentes).

export async function getMembrosData() {
  "use cache";
  cacheTag("membros-list");
  cacheLife("minutes");

  const [users, igrejas, redes] = await Promise.all([
    prisma.user.findMany({
      where: { ocultoDeMembros: false },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        isAdmin: true,
        igrejaId: true,
        redeId: true,
      },
    }),
    prisma.igrejaCasa.findMany({ select: { id: true, nome: true, redeId: true } }),
    prisma.rede.findMany({ select: { id: true, nome: true, liderNome: true } }),
  ]);

  return { users, igrejas, redes };
}

export async function getRedesData() {
  "use cache";
  cacheTag("redes-list");
  cacheLife("minutes");

  const [redes, igrejas] = await Promise.all([
    prisma.rede.findMany({ orderBy: { nome: "asc" } }),
    prisma.igrejaCasa.findMany({ select: { redeId: true } }),
  ]);

  return { redes, igrejas };
}
