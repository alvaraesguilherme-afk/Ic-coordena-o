import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteRedeButton } from "@/components/delete-rede-button";
import { BackLink } from "@/components/back-link";
import { ChurchIcon } from "@/components/icons";

export default async function RedesPage() {
  const [currentUser, redes, igrejas] = await Promise.all([
    getUser(),
    prisma.rede.findMany({ orderBy: { nome: "asc" } }),
    prisma.igrejaCasa.findMany({ select: { redeId: true } }),
  ]);

  const contagemPorRede = new Map<string, number>();
  for (const igreja of igrejas) {
    contagemPorRede.set(igreja.redeId, (contagemPorRede.get(igreja.redeId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Início" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Redes</h1>
        {currentUser.role === "LIDER" && (
          <Link
            href="/redes/nova"
            className="rounded-full bg-gradient-to-r from-sky-500 to-orange-400 px-5 py-2 text-sm font-medium text-white"
          >
            + Nova rede
          </Link>
        )}
      </div>

      {redes.length === 0 && <p className="text-sm text-white/50">Nenhuma rede cadastrada ainda.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {redes.map((rede) => (
          <Link
            key={rede.id}
            href={`/redes/${rede.id}`}
            className="flex aspect-square flex-col justify-between rounded-2xl border border-white/10 bg-white/[.05] p-4 backdrop-blur-xl transition-colors hover:border-sky-400/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/30 to-orange-400/30">
              <ChurchIcon className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <p className="font-medium text-white">{rede.nome}</p>
              {rede.liderNome && <p className="text-xs text-white/50">Líder: {rede.liderNome}</p>}
              <p className="mt-1 text-xs text-white/40">
                {contagemPorRede.get(rede.id) ?? 0} IC(s)
              </p>
            </div>
            {currentUser.role === "LIDER" && <DeleteRedeButton id={rede.id} nome={rede.nome} />}
          </Link>
        ))}
      </div>
    </div>
  );
}
