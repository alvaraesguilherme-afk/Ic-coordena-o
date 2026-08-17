import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ArrowLeftIcon } from "@/components/icons";
import { EscalaIcVagaSlot, type CandidatoIc, type EntradaAtual } from "@/components/escala-ic-vaga-slot";
import { RelatorioIcCard, type RelatorioAtual } from "@/components/relatorio-ic-card";
import { ConcluirGradeIcButton } from "@/components/concluir-grade-ic-button";
import {
  sabadosDoMes,
  dataKey,
  parseMesParam,
  mesAnterior,
  mesSeguinte,
  mesLabel,
} from "@/lib/sabados";
import { TIPO_IC_POR_SLUG, VAGAS_IC, ESCALA_TIPO_LABEL, campoSupervisorIc } from "@/lib/escalas";

export default async function EscalaIcPage(props: PageProps<"/escalas/[tipoIc]">) {
  const { tipoIc: slug } = await props.params;
  const tipo = TIPO_IC_POR_SLUG[slug];
  if (!tipo) {
    notFound();
  }

  const [currentUser, { mes: mesParam }] = await Promise.all([getUser(), props.searchParams]);
  const podeEditar = currentUser.isAdmin || currentUser[campoSupervisorIc(tipo)];
  const meuLiderId = currentUser.role === "LIDER" ? currentUser.id : (currentUser.igreja?.liderId ?? null);

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const sabados = sabadosDoMes(ano, mes);

  const inicioMes = sabados[0] ?? new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);

  const [entradas, icsComLider, relatorios, gradeMes] = await Promise.all([
    prisma.escalaIcEntrada.findMany({
      where: { tipo, data: { gte: inicioMes, lt: fimMes } },
      include: { lider: { select: { name: true } } },
    }),
    prisma.igrejaCasa.findMany({
      where: { liderId: { not: null } },
      select: { nome: true, liderId: true, lider: { select: { name: true } } },
      orderBy: { nome: "asc" },
    }),
    prisma.relatorioEscalaIc.findMany({
      where: { tipo, data: { gte: inicioMes, lt: fimMes } },
    }),
    prisma.gradeIcMes.findUnique({ where: { tipo_ano_mes: { tipo, ano, mes } } }),
  ]);

  const gradeConcluida = Boolean(gradeMes);
  const podeVerGrade = podeEditar || gradeConcluida;

  const candidatos: CandidatoIc[] = icsComLider
    .filter((i) => i.liderId && i.lider)
    .map((i) => ({ liderId: i.liderId as string, nomeLider: i.lider!.name, nomeIc: i.nome }))
    .sort((a, b) => a.nomeLider.localeCompare(b.nomeLider, "pt-BR"));

  const nomeIcPorLiderId = new Map(candidatos.map((c) => [c.liderId, c.nomeIc]));

  const entradaPorCelula = new Map<string, EntradaAtual>();
  const liderIdsPorDia = new Map<string, string[]>();
  for (const entrada of entradas) {
    const chaveDia = dataKey(entrada.data);
    entradaPorCelula.set(`${chaveDia}_${entrada.vaga}`, {
      id: entrada.id,
      liderId: entrada.liderId,
      nomeLider: entrada.lider.name,
      nomeIc: nomeIcPorLiderId.get(entrada.liderId) ?? "IC não identificada",
    });
    liderIdsPorDia.set(chaveDia, [...(liderIdsPorDia.get(chaveDia) ?? []), entrada.liderId]);
  }

  const relatorioPorDia = new Map<string, RelatorioAtual>(
    relatorios.map((r) => [
      dataKey(r.data),
      { visitantes: r.visitantes, presentes: r.presentes, novosConvertidos: r.novosConvertidos },
    ]),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/escalas" label="Voltar" />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white capitalize">
          Escala de {ESCALA_TIPO_LABEL[tipo]} · {mesLabel(ano, mes)}
        </h1>
        {podeEditar && <ConcluirGradeIcButton tipo={tipo} ano={ano} mes={mes} />}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/escalas/${slug}?mes=${anterior.ano}-${String(anterior.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Anterior
        </Link>
        <p className="flex-1 text-center text-sm font-semibold capitalize text-white/80">
          {mesLabel(ano, mes)}
        </p>
        <Link
          href={`/escalas/${slug}?mes=${seguinte.ano}-${String(seguinte.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          Próximo
          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      {!podeVerGrade ? (
        <p className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 text-sm text-white/50 shadow-lg shadow-black/30">
          O supervisor ainda está montando a escala de {mesLabel(ano, mes)}. Assim que ele concluir, você vê
          quem está escalado aqui.
        </p>
      ) : sabados.length === 0 ? (
        <p className="text-sm text-white/50">Esse mês não tem sábados (impossível, mas ok).</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sabados.map((sabado) => (
            <div
              key={dataKey(sabado)}
              className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30"
            >
              <h2 className="mb-3 text-sm font-semibold capitalize text-white">
                {new Intl.DateTimeFormat("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  timeZone: "UTC",
                }).format(sabado)}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {VAGAS_IC.map((vaga) => (
                  <div key={vaga} className="flex flex-col gap-1.5">
                    <span className="text-xs uppercase tracking-wide text-white/40">IC {vaga}</span>
                    <EscalaIcVagaSlot
                      tipo={tipo}
                      data={dataKey(sabado)}
                      vaga={vaga}
                      atual={entradaPorCelula.get(`${dataKey(sabado)}_${vaga}`)}
                      candidatos={candidatos}
                      podeEditar={podeEditar}
                      meuLiderId={meuLiderId}
                    />
                  </div>
                ))}
              </div>

              {tipo === "INTEGRACAO" && (
                <RelatorioIcCard
                  tipo={tipo}
                  data={dataKey(sabado)}
                  atual={relatorioPorDia.get(dataKey(sabado))}
                  podeAcessar={
                    currentUser.isAdmin || (liderIdsPorDia.get(dataKey(sabado)) ?? []).includes(currentUser.id)
                  }
                />
              )}
            </div>
          ))}
        </div>
      )}

      {tipo === "INTEGRACAO" && podeEditar && (
        <Link
          href={`/relatorios-pdf/${slug}?mes=${ano}-${String(mes).padStart(2, "0")}`}
          target="_blank"
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 text-sm font-semibold text-yellow-300 shadow-lg shadow-black/30 hover:border-yellow-400/40"
        >
          📄 Exportar relatórios do mês (PDF)
        </Link>
      )}
    </div>
  );
}
