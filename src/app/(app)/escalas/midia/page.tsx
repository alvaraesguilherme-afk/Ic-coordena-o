import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { AREAS_MIDIA, AREA_MIDIA_LABEL } from "@/lib/areas-midia";
import { FUNCOES_MIDIA, FUNCAO_MIDIA_LABEL, AREA_PARA_FUNCAO } from "@/lib/funcoes-midia";
import { sabadosDoMes, dataKey, parseMesParam, mesAnterior, mesSeguinte, mesLabel } from "@/lib/sabados";
import { ArrowLeftIcon } from "@/components/icons";
import { ConcluirGradeButton } from "@/components/concluir-grade-button";
import { AprovarServoButton } from "@/components/aprovar-servo-button";
import { AreaMidiaBlock } from "@/components/area-midia-block";
import { PermutaMidiaAcao, type PermutaAberta } from "@/components/permuta-midia-acao";
import { nomeReduzido } from "@/lib/user";

export default async function GradeMidiaPage(props: PageProps<"/escalas/midia">) {
  const [currentUser, { mes: mesParam }] = await Promise.all([getUser(), props.searchParams]);

  const podeVer = currentUser.isAdmin || currentUser.servoMidiaStatus === "APROVADO";
  if (!podeVer) {
    redirect("/escalas");
  }
  const podeEditar = currentUser.isAdmin || currentUser.supervisorMidia;

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const sabados = sabadosDoMes(ano, mes);

  const inicioMes = sabados[0] ?? new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);
  const mesAtualStr = `${ano}-${String(mes).padStart(2, "0")}`;

  const [entradas, servos, pedidosPendentes, permutasAbertas] = await Promise.all([
    prisma.escalaMidiaEntrada.findMany({
      where: { data: { gte: inicioMes, lt: fimMes } },
      include: { escalado: { select: { name: true } }, treinando: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { servoMidiaStatus: "APROVADO" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        areasServoMidia: { select: { area: true, nivel: true } },
      },
    }),
    podeEditar
      ? prisma.user.findMany({
          where: { servoMidiaStatus: "PENDENTE" },
          orderBy: { servoMidiaSolicitadoEm: "asc" },
          select: {
            id: true,
            name: true,
            areaSolicitadaMidia: true,
            servoMidiaSolicitadoEm: true,
            igreja: { select: { nome: true, lider: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
    prisma.permutaMidia.findMany({
      where: { status: "ABERTA", entrada: { data: { gte: inicioMes, lt: fimMes } } },
      select: { id: true, entradaId: true, solicitanteId: true, solicitante: { select: { name: true } } },
    }),
  ]);

  const entradaPorCelula = new Map<string, (typeof entradas)[number]>();
  for (const entrada of entradas) {
    entradaPorCelula.set(`${entrada.area}_${dataKey(entrada.data)}`, entrada);
  }

  const permutaPorEntradaId = new Map<string, PermutaAberta>(
    permutasAbertas.map((p) => [
      p.entradaId,
      { id: p.id, solicitanteId: p.solicitanteId, solicitanteNome: p.solicitante.name },
    ]),
  );

  const minhasAreasVeteranas = new Set(
    servos
      .find((s) => s.id === currentUser.id)
      ?.areasServoMidia.filter((a) => a.nivel === "VETERANO")
      .map((a) => a.area) ?? [],
  );

  const membrosPorArea = new Map<
    string,
    { userId: string; nome: string; avatarUrl: string | null; nivel: "TREINEIRO" | "VETERANO" }[]
  >();
  for (const servo of servos) {
    for (const { area, nivel } of servo.areasServoMidia) {
      const lista = membrosPorArea.get(area) ?? [];
      lista.push({ userId: servo.id, nome: servo.name, avatarUrl: servo.avatarUrl, nivel });
      membrosPorArea.set(area, lista);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white capitalize">
          Grade de mídia · {mesLabel(ano, mes)}
        </h1>
        {podeEditar && <ConcluirGradeButton ano={ano} mes={mes} />}
      </div>

      {podeEditar && pedidosPendentes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-yellow-400/40 bg-gradient-to-b from-yellow-400/[.10] to-yellow-400/[.02] p-5 shadow-lg shadow-black/30">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
            Pedidos pra servir na mídia ({pedidosPendentes.length})
          </h2>
          <ul className="flex flex-col divide-y divide-white/10">
            {pedidosPendentes.map((pessoa) => (
              <li key={pessoa.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm text-white">
                    {pessoa.name}
                    {pessoa.areaSolicitadaMidia && (
                      <span className="text-white/40"> · {FUNCAO_MIDIA_LABEL[pessoa.areaSolicitadaMidia]}</span>
                    )}
                  </p>
                  <p className="text-xs text-white/40">
                    {pessoa.igreja
                      ? `${pessoa.igreja.nome} · Líder: ${pessoa.igreja.lider?.name ?? "sem líder"}`
                      : "Sem IC cadastrada"}
                  </p>
                  {pessoa.servoMidiaSolicitadoEm && (
                    <p className="text-xs text-white/40">
                      Pedido em{" "}
                      {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                        pessoa.servoMidiaSolicitadoEm,
                      )}
                    </p>
                  )}
                </div>
                <AprovarServoButton userId={pessoa.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          href={`/escalas/midia?mes=${anterior.ano}-${String(anterior.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Anterior
        </Link>
        <Link
          href={`/escalas/midia?mes=${seguinte.ano}-${String(seguinte.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          Próximo
          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      {sabados.length === 0 ? (
        <p className="text-sm text-white/50">Esse mês não tem sábados (impossível, mas ok).</p>
      ) : (
        <>
          {/* Celular: um cartão por sábado, áreas empilhadas — sem scroll horizontal */}
          <div className="flex flex-col gap-4 sm:hidden">
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
                <ul className="flex flex-col divide-y divide-white/10">
                  {AREAS_MIDIA.map((area) => {
                    const chave = `${area}_${dataKey(sabado)}`;
                    const entrada = entradaPorCelula.get(chave);
                    const href = `/escalas/midia/editar?area=${area}&data=${dataKey(sabado)}&mes=${mesAtualStr}`;

                    return (
                      <li key={chave} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="text-white/60">{AREA_MIDIA_LABEL[area]}</span>
                        {entrada ? (
                          <div className="flex flex-col items-end gap-1 text-right">
                            <Link
                              href={podeEditar ? href : "#"}
                              className={`flex flex-col items-end gap-0.5 ${podeEditar ? "hover:underline" : "pointer-events-none"}`}
                            >
                              <span
                                className={`text-white ${entrada.escaladoId === currentUser.id ? "rounded-full border border-yellow-400 px-2 py-0.5" : ""}`}
                              >
                                {nomeReduzido(entrada.escalado.name)}
                              </span>
                              {entrada.treinando && (
                                <span
                                  className={`text-xs text-yellow-300/80 ${entrada.treinandoId === currentUser.id ? "rounded-full border border-yellow-400 px-2 py-0.5" : ""}`}
                                >
                                  treinando: {nomeReduzido(entrada.treinando.name)}
                                </span>
                              )}
                            </Link>
                            <PermutaMidiaAcao
                              entradaId={entrada.id}
                              currentUserId={currentUser.id}
                              isEscalado={entrada.escaladoId === currentUser.id}
                              souVeteranoNaArea={minhasAreasVeteranas.has(AREA_PARA_FUNCAO[area])}
                              permutaAberta={permutaPorEntradaId.get(entrada.id)}
                            />
                          </div>
                        ) : podeEditar ? (
                          <Link href={href} className="text-white/40 hover:text-yellow-300 hover:underline">
                            + adicionar
                          </Link>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Desktop: tabela área × sábados */}
          <div className="hidden overflow-x-auto rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl sm:block">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white/[.08] p-3 text-left font-semibold text-white/70">
                    Área
                  </th>
                  {sabados.map((sabado) => (
                    <th key={dataKey(sabado)} className="p-3 text-left font-semibold text-white/70">
                      {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(
                        sabado,
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AREAS_MIDIA.map((area) => (
                  <tr key={area} className="border-t border-white/10">
                    <td className="sticky left-0 bg-[#0c1445]/80 p-3 font-medium text-white">
                      {AREA_MIDIA_LABEL[area]}
                    </td>
                    {sabados.map((sabado) => {
                      const chave = `${area}_${dataKey(sabado)}`;
                      const entrada = entradaPorCelula.get(chave);
                      const href = `/escalas/midia/editar?area=${area}&data=${dataKey(sabado)}&mes=${mesAtualStr}`;

                      return (
                        <td key={chave} className="p-3 align-top">
                          {entrada ? (
                            <div className="flex flex-col gap-1">
                              <Link
                                href={podeEditar ? href : "#"}
                                className={`flex flex-col gap-0.5 ${podeEditar ? "hover:underline" : "pointer-events-none"}`}
                              >
                                <span
                                  className={`text-white ${entrada.escaladoId === currentUser.id ? "w-fit rounded-full border border-yellow-400 px-2 py-0.5" : ""}`}
                                >
                                  {nomeReduzido(entrada.escalado.name)}
                                </span>
                                {entrada.treinando && (
                                  <span
                                    className={`text-xs text-yellow-300/80 ${entrada.treinandoId === currentUser.id ? "w-fit rounded-full border border-yellow-400 px-2 py-0.5" : ""}`}
                                  >
                                    treinando: {nomeReduzido(entrada.treinando.name)}
                                  </span>
                                )}
                              </Link>
                              <PermutaMidiaAcao
                                entradaId={entrada.id}
                                currentUserId={currentUser.id}
                                isEscalado={entrada.escaladoId === currentUser.id}
                                souVeteranoNaArea={minhasAreasVeteranas.has(AREA_PARA_FUNCAO[area])}
                                permutaAberta={permutaPorEntradaId.get(entrada.id)}
                              />
                            </div>
                          ) : podeEditar ? (
                            <Link href={href} className="text-white/40 hover:text-yellow-300 hover:underline">
                              + adicionar
                            </Link>
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {podeVer && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Equipe de mídia
          </h2>

          {servos.length === 0 ? (
            <p className="text-sm text-white/40">Nenhum servo de mídia aprovado ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {FUNCOES_MIDIA.map((area) => {
                const membros = membrosPorArea.get(area) ?? [];
                const disponiveis = servos
                  .filter((s) => !membros.some((m) => m.userId === s.id))
                  .map((s) => ({ id: s.id, nome: s.name }));

                return (
                  <AreaMidiaBlock
                    key={area}
                    area={area}
                    membros={membros}
                    disponiveis={disponiveis}
                    podeEditar={podeEditar}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
