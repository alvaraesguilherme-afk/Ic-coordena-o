import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ArrowLeftIcon, PersonIcon } from "@/components/icons";
import { PresencaMarcacao } from "@/components/presenca-marcacao";
import { dataKey } from "@/lib/sabados";
import {
  encontroAnterior,
  encontroSeguinte,
  formatDataEncontro,
  formatDataFalta,
  parseDataParam,
} from "@/lib/frequencia";

export default async function FrequenciaIcPage(props: PageProps<"/redes/[id]/igrejas/[igrejaId]/frequencia">) {
  const [{ id, igrejaId }, { data: dataParam }, currentUser] = await Promise.all([
    props.params,
    props.searchParams,
    getUser(),
  ]);

  const [igreja, membros, faltasDaIc] = await Promise.all([
    prisma.igrejaCasa.findUnique({
      where: { id: igrejaId },
      select: { nome: true, redeId: true, liderId: true, diaSemana: true, horario: true },
    }),
    prisma.user.findMany({
      where: { igrejaId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, avatarUrl: true },
    }),
    prisma.presenca.findMany({
      where: { presente: false, reuniao: { igrejaId } },
      select: {
        id: true,
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
  const anterior = encontroAnterior(data);
  const seguinte = encontroSeguinte(data);

  const reuniao = await prisma.reuniao.findUnique({
    where: { igrejaId_data: { igrejaId, data } },
    include: { presencas: { select: { userId: true, presente: true, motivo: true } } },
  });
  const presencaPorMembro = new Map(reuniao?.presencas.map((p) => [p.userId, p]) ?? []);

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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 pt-2">
      <BackLink href={`/redes/${id}/igrejas/${igrejaId}`} label="Voltar" />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Lista de Frequência</h1>
        <p className="text-sm text-white/50">{igreja.nome}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href={`/redes/${id}/igrejas/${igrejaId}/frequencia?data=${dataKey(anterior)}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <p className="flex-1 text-center text-sm font-semibold text-white/80">
          {formatDataEncontro(data, igreja.horario)}
        </p>
        <Link
          href={`/redes/${id}/igrejas/${igrejaId}/frequencia?data=${dataKey(seguinte)}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      {membros.length === 0 ? (
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
              />
            </li>
          ))}
        </ul>
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
