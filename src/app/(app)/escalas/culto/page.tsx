import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ArrowLeftIcon } from "@/components/icons";
import { sabadosDoMes, dataKey, parseMesParam, mesAnterior, mesSeguinte, mesLabel } from "@/lib/sabados";
import { ConcluirGradeCultoButton } from "@/components/concluir-grade-culto-button";
import {
  EscalaCultoDiaSlot,
  type CandidatoCulto,
  type EntradaCultoAtual,
} from "@/components/escala-culto-dia-slot";
import { AutorizadosCultoManager } from "@/components/autorizados-culto-manager";

export default async function EscalaCultoPage(props: PageProps<"/escalas/culto">) {
  const [currentUser, { mes: mesParam }] = await Promise.all([getUser(), props.searchParams]);

  const podeVer =
    currentUser.isAdmin || currentUser.supervisorDirecaoCulto || currentUser.autorizadoDirecaoCulto;
  if (!podeVer) {
    redirect("/escalas");
  }
  const podeEditar = currentUser.isAdmin || currentUser.supervisorDirecaoCulto;

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const sabados = sabadosDoMes(ano, mes);

  const inicioMes = sabados[0] ?? new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);

  const [entradas, autorizadosUsuarios, naoAutorizados, gradeMes] = await Promise.all([
    prisma.escalaCultoEntrada.findMany({
      where: { data: { gte: inicioMes, lt: fimMes } },
      include: { escalado: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { autorizadoDirecaoCulto: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    podeEditar
      ? prisma.user.findMany({
          where: { autorizadoDirecaoCulto: false },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    prisma.gradeCultoMes.findUnique({ where: { ano_mes: { ano, mes } } }),
  ]);

  const gradeConcluida = Boolean(gradeMes);
  const podeVerGrade = podeEditar || gradeConcluida;

  const candidatos: CandidatoCulto[] = autorizadosUsuarios.map((u) => ({ id: u.id, nome: u.name }));

  const entradaPorDia = new Map<string, EntradaCultoAtual>(
    entradas.map((e) => [
      dataKey(e.data),
      { id: e.id, escaladoId: e.escaladoId, nomeEscalado: e.escalado.name },
    ]),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/escalas" label="Voltar" />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Direção de Culto · {mesLabel(ano, mes)}
        </h1>
        {podeEditar && <ConcluirGradeCultoButton ano={ano} mes={mes} />}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/escalas/culto?mes=${anterior.ano}-${String(anterior.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Anterior
        </Link>
        <p className="flex-1 text-center text-sm font-semibold capitalize text-white/80">
          {mesLabel(ano, mes)}
        </p>
        <Link
          href={`/escalas/culto?mes=${seguinte.ano}-${String(seguinte.mes).padStart(2, "0")}`}
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
        <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
          {sabados.map((sabado) => (
            <li key={dataKey(sabado)} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="text-sm capitalize text-white/70">
                {new Intl.DateTimeFormat("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  timeZone: "UTC",
                }).format(sabado)}
              </span>
              <EscalaCultoDiaSlot
                data={dataKey(sabado)}
                atual={entradaPorDia.get(dataKey(sabado))}
                candidatos={candidatos}
                podeEditar={podeEditar}
              />
            </li>
          ))}
        </ul>
      )}

      {podeEditar && (
        <AutorizadosCultoManager autorizados={autorizadosUsuarios} candidatos={naoAutorizados} />
      )}
    </div>
  );
}
