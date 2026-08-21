import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ChurchIcon, LinkIcon, PersonIcon } from "@/components/icons";
import { DIAS_SEMANA, formatEncontroIC, redeNomeSemPrefixo } from "@/lib/igrejas";
import { hojeEmBRT } from "@/lib/frequencia";

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

  const diaSemanaHoje = DIAS_SEMANA[hojeEmBRT().getUTCDay()];

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

  // Quem está em sequência de faltas seguidas, em qualquer IC — pra dar pra
  // ver direto aqui, sem precisar entrar IC por IC.
  const presencas = await prisma.presenca.findMany({
    where: { reuniao: { igrejaId: { in: igrejas.map((i) => i.id) } } },
    select: {
      presente: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      reuniao: { select: { data: true, igrejaId: true } },
    },
    orderBy: { reuniao: { data: "desc" } },
  });

  const igrejaPorId = new Map(igrejas.map((i) => [i.id, i]));
  const resumoPorMembroIc = new Map<
    string,
    {
      userId: string;
      name: string;
      avatarUrl: string | null;
      igrejaId: string;
      igrejaNome: string;
      redeId: string;
      streakAtual: number;
      streakAberta: boolean;
    }
  >();
  for (const p of presencas) {
    const igreja = igrejaPorId.get(p.reuniao.igrejaId);
    if (!igreja) continue;
    const chave = `${p.user.id}:${igreja.id}`;
    const atual = resumoPorMembroIc.get(chave) ?? {
      userId: p.user.id,
      name: p.user.name,
      avatarUrl: p.user.avatarUrl,
      igrejaId: igreja.id,
      igrejaNome: igreja.nome,
      redeId: igreja.redeId,
      streakAtual: 0,
      streakAberta: true,
    };
    if (!p.presente) {
      if (atual.streakAberta) atual.streakAtual += 1;
    } else {
      atual.streakAberta = false;
    }
    resumoPorMembroIc.set(chave, atual);
  }
  const emAlerta = [...resumoPorMembroIc.values()]
    .filter((m) => m.streakAtual >= 2)
    .sort((a, b) => b.streakAtual - a.streakAtual || a.name.localeCompare(b.name, "pt-BR"));

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

      {emAlerta.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Atenção — faltas seguidas
          </h2>
          <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
            {emAlerta.map((m) => (
              <li key={`${m.userId}:${m.igrejaId}`}>
                <Link
                  href={`/redes/${m.redeId}/igrejas/${m.igrejaId}/frequencia?voltar=/frequencia`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[.05] active:bg-white/10"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                    ) : (
                      <PersonIcon className="h-4 w-4 text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{m.name}</p>
                    <p className="truncate text-xs text-white/40">{m.igrejaNome}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      m.streakAtual >= 3 ? "bg-red-500/20 text-red-300" : "bg-yellow-400/15 text-yellow-300"
                    }`}
                  >
                    {m.streakAtual} seguidas
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

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
                    className={`flex items-center gap-3 border-l-4 px-5 py-4 transition-colors hover:bg-white/[.05] active:bg-white/10 ${
                      faltas > 0 ? "border-red-500/70" : "border-transparent"
                    } ${igreja.diaSemana === diaSemanaHoje ? "m-1.5 rounded-xl ring-2 ring-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.4)]" : ""}`}
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
            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] px-5 py-4 shadow-lg shadow-black/30 transition hover:border-yellow-400/40 active:scale-95"
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
