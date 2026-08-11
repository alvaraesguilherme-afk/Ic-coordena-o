import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteIgrejaButton } from "@/components/delete-igreja-button";
import { BackLink } from "@/components/back-link";
import { formatEncontroIC } from "@/lib/igrejas";

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
      <BackLink href="/inicio" label="Início" />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{rede.nome}</h1>
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

      <ul className="flex flex-col divide-y divide-white/10">
        {igrejas.map((igreja) => (
          <li key={igreja.id}>
            <Link
              href={`/redes/${rede.id}/igrejas/${igreja.id}`}
              className="flex items-center justify-between py-4 transition-colors hover:bg-white/[.03]"
            >
              <div>
                <p className="font-medium text-white">{igreja.nome}</p>
                {igreja.lider && (
                  <p className="text-sm text-white/50">Líder: {igreja.lider.name}</p>
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
    </div>
  );
}
