import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ArrowLeftIcon, PersonIcon } from "@/components/icons";
import { PresencaMarcacao } from "@/components/presenca-marcacao";
import { FinalizarFrequenciaButton } from "@/components/finalizar-frequencia-button";
import { RemarcarEncontroButton } from "@/components/remarcar-encontro-button";
import { CancelarEncontroButton } from "@/components/cancelar-encontro-button";
import { dataKey } from "@/lib/sabados";
import {
  encontroAnterior,
  encontroSeguinte,
  encontroTravado,
  foraDoCiclo,
  formatDataEncontro,
  formatDataFalta,
  hojeEmBRT,
  parseDataParam,
} from "@/lib/frequencia";

export default async function FrequenciaIcPage(props: PageProps<"/redes/[id]/igrejas/[igrejaId]/frequencia">) {
  const [{ id, igrejaId }, { data: dataParam, voltar }, currentUser] = await Promise.all([
    props.params,
    props.searchParams,
    getUser(),
  ]);
  const backHref =
    typeof voltar === "string" && voltar.startsWith("/") ? voltar : `/redes/${id}/igrejas/${igrejaId}`;

  const [igreja, membros, todasPresencasDaIc] = await Promise.all([
    prisma.igrejaCasa.findUnique({
      where: { id: igrejaId },
      select: { nome: true, redeId: true, liderId: true, diaSemana: true, horario: true },
    }),
    prisma.user.findMany({
      where: { igrejaId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, avatarUrl: true },
    }),
    // Todas as presenças (não só falta) — dá pra derivar tanto a lista por
    // data quanto o resumo por membro (total + sequência atual) sem precisar
    // de uma segunda query.
    prisma.presenca.findMany({
      where: { reuniao: { igrejaId } },
      select: {
        id: true,
        presente: true,
        motivo: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
        reuniao: { select: { data: true } },
      },
      orderBy: { reuniao: { data: "desc" } },
    }),
  ]);

  if (!igreja || igreja.redeId !== id) {
    notFound();
  }

  const podeGerenciar = currentUser.isAdmin || currentUser.id === igreja.liderId;
  if (!podeGerenciar) {
    redirect(`/redes/${id}/igrejas/${igrejaId}`);
  }

  const data = parseDataParam(typeof dataParam === "string" ? dataParam : undefined, igreja.diaSemana);
  const anterior = encontroAnterior(data, igreja.diaSemana);
  const seguinte = encontroSeguinte(data, igreja.diaSemana);
  const travada = encontroTravado(data);
  const hoje = hojeEmBRT();

  const reuniao = await prisma.reuniao.findUnique({
    where: { igrejaId_data: { igrejaId, data } },
    include: { presencas: { select: { userId: true, presente: true, motivo: true } } },
  });
  const presencaPorMembro = new Map(reuniao?.presencas.map((p) => [p.userId, p]) ?? []);

  const faltasDaIc = todasPresencasDaIc.filter((p) => !p.presente);

  const gruposFaltas = new Map<string, { data: Date; itens: typeof faltasDaIc }>();
  for (const falta of faltasDaIc) {
    const chave = falta.reuniao.data.toISOString();
    const grupo = gruposFaltas.get(chave);
    if (grupo) {
      grupo.itens.push(falta);
    } else {
      gruposFaltas.set(chave, { data: falta.reuniao.data, itens: [falta] });
    }
  }

  // Resumo por membro: total de faltas + sequência atual de faltas seguidas
  // (conta pra trás a partir da reunião mais recente até achar um presente).
  // todasPresencasDaIc já vem ordenado por data desc, então a ordem de
  // iteração por membro também é do mais recente pro mais antigo.
  const resumoPorMembro = new Map<
    string,
    { id: string; name: string; avatarUrl: string | null; totalFaltas: number; streakAtual: number; streakAberta: boolean }
  >();
  for (const p of todasPresencasDaIc) {
    const atual = resumoPorMembro.get(p.user.id) ?? {
      id: p.user.id,
      name: p.user.name,
      avatarUrl: p.user.avatarUrl,
      totalFaltas: 0,
      streakAtual: 0,
      streakAberta: true,
    };
    if (!p.presente) {
      atual.totalFaltas += 1;
      if (atual.streakAberta) atual.streakAtual += 1;
    } else {
      atual.streakAberta = false;
    }
    resumoPorMembro.set(p.user.id, atual);
  }
  const faltososOrdenados = [...resumoPorMembro.values()]
    .filter((m) => m.totalFaltas > 0)
    .sort(
      (a, b) =>
        b.totalFaltas - a.totalFaltas ||
        b.streakAtual - a.streakAtual ||
        a.name.localeCompare(b.name, "pt-BR")
    );

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 pt-2">
      <BackLink href={backHref} label="Voltar" />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Lista de Frequência</h1>
        <p className="text-sm text-white/50">{igreja.nome}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/redes/${id}/igrejas/${igrejaId}/frequencia?data=${dataKey(anterior)}&voltar=${encodeURIComponent(backHref)}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <p className="flex-1 text-center text-sm font-semibold text-white/80">
          {formatDataEncontro(data, igreja.horario)}
          {travada && <span className="ml-2 text-xs font-normal text-white/40">· travada</span>}
        </p>
        <Link
          href={`/redes/${id}/igrejas/${igrejaId}/frequencia?data=${dataKey(seguinte)}&voltar=${encodeURIComponent(backHref)}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4">
        <RemarcarEncontroButton
          redeId={id}
          igrejaId={igrejaId}
          hoje={hoje}
          dataAtualStr={dataKey(data)}
        />
        {(reuniao?.cancelada ||
          data.getTime() === hoje.getTime() ||
          foraDoCiclo(data, igreja.diaSemana)) && (
          <CancelarEncontroButton
            igrejaId={igrejaId}
            dataStr={dataKey(data)}
            cancelada={reuniao?.cancelada ?? false}
            temFrequenciaMarcada={(reuniao?.presencas.length ?? 0) > 0}
          />
        )}
      </div>

      {reuniao?.cancelada ? (
        <p className="rounded-2xl border border-white/15 bg-white/[.05] p-4 text-center text-sm text-white/60">
          Não houve encontro nessa semana.
        </p>
      ) : membros.length === 0 ? (
        <p className="text-sm text-white/50">Nenhum membro cadastrado nesta IC ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
          {membros.map((membro) => (
            <li key={membro.id} className="flex items-center gap-3 px-5 py-3">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                {membro.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={membro.avatarUrl} alt={membro.name} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm text-white">{membro.name}</p>
              <PresencaMarcacao
                key={dataKey(data)}
                igrejaId={igrejaId}
                dataStr={dataKey(data)}
                membroId={membro.id}
                presenteInicial={presencaPorMembro.get(membro.id)?.presente ?? null}
                motivoInicial={presencaPorMembro.get(membro.id)?.motivo ?? null}
                travada={travada}
              />
            </li>
          ))}
        </ul>
      )}

      {membros.length > 0 && !reuniao?.cancelada && (
        <FinalizarFrequenciaButton
          igrejaId={igrejaId}
          dataStr={dataKey(data)}
          finalizadaInicial={!!reuniao?.finalizadaEm}
          travada={travada}
        />
      )}

      {faltososOrdenados.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Faltas por Membro</h2>
          <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
            {faltososOrdenados.map((membro) => (
              <li key={membro.id} className="flex items-center gap-3 px-5 py-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                  {membro.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={membro.avatarUrl} alt={membro.name} className="h-full w-full object-cover" />
                  ) : (
                    <PersonIcon className="h-4 w-4 text-white/40" />
                  )}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm text-white">{membro.name}</p>
                {membro.streakAtual >= 2 && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      membro.streakAtual >= 3 ? "bg-red-500/20 text-red-300" : "bg-yellow-400/15 text-yellow-300"
                    }`}
                  >
                    {membro.streakAtual} seguidas
                  </span>
                )}
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/60">
                  {membro.totalFaltas} {membro.totalFaltas === 1 ? "falta" : "faltas"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Registro de Faltas</h2>

        {gruposFaltas.size === 0 ? (
          <p className="text-sm text-white/50">Nenhuma falta registrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {[...gruposFaltas.values()].map((grupo) => (
              <div
                key={grupo.data.toISOString()}
                className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30"
              >
                <h3 className="mb-3 text-sm font-semibold text-white">{formatDataFalta(grupo.data)}</h3>

                <ul className="flex flex-col gap-3">
                  {grupo.itens.map((falta) => (
                    <li key={falta.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                        {falta.user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={falta.user.avatarUrl}
                            alt={falta.user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PersonIcon className="h-4 w-4 text-white/40" />
                        )}
                      </div>
                      <p className="w-32 shrink-0 truncate text-sm text-white">{falta.user.name}</p>
                      <p className="flex-1 truncate text-sm text-white/50">
                        {falta.motivo || <span className="text-white/25">Sem motivo informado</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
