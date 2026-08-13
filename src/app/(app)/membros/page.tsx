import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { UsersIcon } from "@/components/icons";
import { MembrosList } from "@/components/membros-list";

export default async function MembrosPage() {
  const [, users, igrejas, redes] = await Promise.all([
    getUser(),
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
    prisma.rede.findMany({ select: { id: true, nome: true } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 pt-2">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
          <UsersIcon className="h-5 w-5 text-yellow-100" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Membros</h1>
          <p className="text-sm text-white/50">{users.length} pessoas na rede Impulse</p>
        </div>
      </div>

      <MembrosList users={users} igrejas={igrejas} redes={redes} />
    </div>
  );
}
