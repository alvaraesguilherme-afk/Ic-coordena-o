import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { UsersIcon } from "@/components/icons";
import { roleLabel } from "@/lib/user";
import { redeNomeSemPrefixo } from "@/lib/igrejas";

export default async function MembrosPage() {
  const [, users, igrejas, redes] = await Promise.all([
    getUser(),
    prisma.user.findMany({
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

  const redeNomePorId = new Map(redes.map((r) => [r.id, r.nome]));
  const igrejaPorId = new Map(igrejas.map((i) => [i.id, i]));

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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {users.map((user) => {
          const igreja = user.igrejaId ? igrejaPorId.get(user.igrejaId) : undefined;
          const redeNomeBruto =
            user.role === "PASTOR"
              ? "Rede Impulse"
              : igreja
                ? redeNomePorId.get(igreja.redeId)
                : user.redeId
                  ? redeNomePorId.get(user.redeId)
                  : undefined;
          const redeNome = redeNomeBruto ? redeNomeSemPrefixo(redeNomeBruto) : undefined;

          return (
            <Link
              key={user.id}
              href={`/membros/${user.id}`}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[.05] p-4 text-center backdrop-blur-xl transition-colors hover:border-yellow-400/40"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/10">
                {user.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <p className="text-sm font-medium text-white">{user.name}</p>

              {(user.role === "LIDER" || user.isAdmin) && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                  {roleLabel(user)}
                </span>
              )}

              <p className="text-xs text-white/40">
                {igreja && redeNome
                  ? `${redeNome} · ${igreja.nome}`
                  : redeNome
                    ? redeNome
                    : "Sem rede ainda"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
