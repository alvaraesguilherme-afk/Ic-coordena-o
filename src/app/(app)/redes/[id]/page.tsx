import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteIgrejaButton } from "@/components/delete-igreja-button";
import { BackLink } from "@/components/back-link";
import { ChurchIcon, CalendarIcon } from "@/components/icons";
import { formatEncontroIC, redeNomeSemPrefixo } from "@/lib/igrejas";

export default async function RedeDetailPage({ params }: PageProps<"/redes/[id]">) {
  const { id } = await params;

  const [currentUser, rede, igrejas] = await Promise.all([
    getUser(),
    prisma.rede.findUnique({ where: { id } }),
    prisma.igrejaCasa.findMany({
      where: { redeId: id },
      orderBy: { nome: "asc" },
      include: { lider: { select: { name: true } } },
    }),
  ]);

  if (!rede) {
    notFound();
  }

  const isLiderDaRede =
    currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === rede.id);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" fixedDestination />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{redeNomeSemPrefixo(rede.nome)}</h1>
        {rede.liderNome && <p className="text-sm text-white/50">Líder: {rede.liderNome}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
          ICs — Igrejas nas Casas
        </h2>
        {isLiderDaRede && (
          <Link
            href={`/redes/${rede.id}/igrejas/nova`}
            className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445]"
          >
            + Nova IC
          </Link>
        )}
      </div>

      {igrejas.length === 0 && <p className="text-sm text-white/50">Nenhuma IC cadastrada ainda.</p>}

      {igrejas.length > 0 && (
        <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
          {igrejas.map((igreja) => (
            <li key={igreja.id}>
              <Link
                href={`/redes/${rede.id}/igrejas/${igreja.id}`}
                className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-white/[.05]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
                  <ChurchIcon className="h-5 w-5 text-yellow-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{igreja.nome}</p>
                  {igreja.lider && (
                    <p className="truncate text-sm text-white/50">Líder: {igreja.lider.name}</p>
                  )}
                  <p className="text-sm text-white/40">
                    {formatEncontroIC(igreja.diaSemana, igreja.horario)}
                  </p>
                </div>
                {isLiderDaRede && (
                  <DeleteIgrejaButton id={igreja.id} nome={igreja.nome} redeId={rede.id} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/redes/${rede.id}/eventos`}
        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] px-5 py-4 shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:bg-white/[.08]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
          <CalendarIcon className="h-5 w-5 text-yellow-100" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">Eventos</p>
          <p className="text-sm text-white/40">Aniversários, Celulão e outras datas da rede</p>
        </div>
      </Link>
    </div>
  );
}
