import { notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ArrowLeftIcon } from "@/components/icons";
import { EscalaIcVagaSlot, type CandidatoIc, type EntradaAtual } from "@/components/escala-ic-vaga-slot";
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

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const sabados = sabadosDoMes(ano, mes);

  const inicioMes = sabados[0] ?? new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);

  const [entradas, icsComLider] = await Promise.all([
    prisma.escalaIcEntrada.findMany({
      where: { tipo, data: { gte: inicioMes, lt: fimMes } },
      include: { lider: { select: { name: true } } },
    }),
    prisma.igrejaCasa.findMany({
      where: { liderId: { not: null } },
      select: { nome: true, liderId: true, lider: { select: { name: true } } },
      orderBy: { nome: "asc" },
    }),
  ]);

  const candidatos: CandidatoIc[] = icsComLider
    .filter((i) => i.liderId && i.lider)
    .map((i) => ({ liderId: i.liderId as string, nomeLider: i.lider!.name, nomeIc: i.nome }));

  const nomeIcPorLiderId = new Map(candidatos.map((c) => [c.liderId, c.nomeIc]));

  const entradaPorCelula = new Map<string, EntradaAtual>();
  for (const entrada of entradas) {
    entradaPorCelula.set(`${dataKey(entrada.data)}_${entrada.vaga}`, {
      id: entrada.id,
      liderId: entrada.liderId,
      nomeLider: entrada.lider.name,
      nomeIc: nomeIcPorLiderId.get(entrada.liderId) ?? "IC não identificada",
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/escalas" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white capitalize">
        Escala de {ESCALA_TIPO_LABEL[tipo]} · {mesLabel(ano, mes)}
      </h1>

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

      {sabados.length === 0 ? (
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
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
