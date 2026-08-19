import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ChurchIcon, LinkIcon } from "@/components/icons";
import { formatEncontroIC, redeNomeSemPrefixo } from "@/lib/igrejas";

export default async function FrequenciaAdminPage() {
  const [currentUser, igrejas] = await Promise.all([
    getUser(),
    prisma.igrejaCasa.findMany({
      orderBy: [{ rede: { nome: "asc" } }, { nome: "asc" }],
      include: {
        lider: { select: { name: true } },
        rede: { select: { id: true, nome: true } },
        _count: { select: { membros: true } },
      },
    }),
  ]);

  if (!currentUser.isAdmin) {
    redirect("/inicio");
  }

  const reunioes = await prisma.reuniao.findMany({
    where: { igrejaId: { in: igrejas.map((i) => i.id) } },
    orderBy: { data: "desc" },
    include: { presencas: { select: { presente: true } } },
  });

  const ultimaReuniaoPorIc = new Map<string, (typeof reunioes)[number]>();
  for (const reuniao of reunioes) {
    if (!ultimaReuniaoPorIc.has(reuniao.igrejaId)) {
      ultimaReuniaoPorIc.set(reuniao.igrejaId, reuniao);
    }
  }

  const grupos = new Map<string, { id: string; nome: string; igrejas: typeof igrejas }>();
  for (const igreja of igrejas) {
    const grupo = grupos.get(igreja.rede.id);
    if (grupo) {
      grupo.igrejas.push(igreja);
    } else {
      grupos.set(igreja.rede.id, { id: igreja.rede.id, nome: igreja.rede.nome, igrejas: [igreja] });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/configuracoes" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Frequência das ICs</h1>

      {igrejas.length === 0 && <p className="text-sm text-white/50">Nenhuma IC cadastrada ainda.</p>}

      {[...grupos.values()].map((grupo) => (
        <div key={grupo.id} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            {redeNomeSemPrefixo(grupo.nome)}
          </h2>

          <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
            {grupo.igrejas.map((igreja) => {
              const ultima = ultimaReuniaoPorIc.get(igreja.id);
              const presentes = ultima?.presencas.filter((p) => p.presente).length ?? 0;
              const faltas = ultima?.presencas.filter((p) => !p.presente).length ?? 0;

              return (
                <li key={igreja.id}>
                  <Link
                    href={`/redes/${igreja.redeId}/igrejas/${igreja.id}/frequencia?voltar=/frequencia`}
                    className={`flex items-center gap-3 border-l-4 px-5 py-4 transition-colors hover:bg-white/[.05] ${
                      faltas > 0 ? "border-red-500/70" : "border-transparent"
                    }`}
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
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-right text-xs text-white/40">
                        {ultima ? (
                          <>
                            {presentes}/{igreja._count.membros}
                            <br />
                            presentes
                          </>
                        ) : (
                          "Sem registro"
                        )}
                      </p>
                      {faltas > 0 && (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                          {faltas} {faltas === 1 ? "falta" : "faltas"}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href={`/relatorios-pdf/frequencia/${grupo.id}`}
            target="_blank"
            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] px-5 py-4 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
              <LinkIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">Exportar PDF</p>
              <p className="text-sm text-white/40">Relação de faltas do mês, pra imprimir ou salvar</p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
