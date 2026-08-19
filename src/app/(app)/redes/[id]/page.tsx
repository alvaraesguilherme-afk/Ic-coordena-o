import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteIgrejaButton } from "@/components/delete-igreja-button";
import { BackLink } from "@/components/back-link";
import { ChurchIcon, CalendarIcon, PersonIcon } from "@/components/icons";
import { formatEncontroIC, redeNomeSemPrefixo } from "@/lib/igrejas";
import { formatDataFalta } from "@/lib/frequencia";
import { nomesIguais } from "@/lib/user";

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
  const pertenceARede =
    currentUser.isAdmin || currentUser.redeId === rede.id || currentUser.igreja?.redeId === rede.id;

  // Supervisor da rede (a única pessoa em Rede.liderNome) vê as faltas de todas
  // as ICs; um líder comum só vê as da(s) IC(s) que ele mesmo lidera, mesmo sendo
  // da mesma rede — não pode ver faltas de outra IC que não é dele.
  const isSupervisorDaRede =
    currentUser.isAdmin || (currentUser.role === "LIDER" && nomesIguais(rede.liderNome, currentUser.name));
  const lideraAlgumaIcDaRede = igrejas.some((i) => i.liderId === currentUser.id);
  const podeVerFaltas = isSupervisorDaRede || lideraAlgumaIcDaRede;

  const faltas = podeVerFaltas
    ? await prisma.presenca.findMany({
        where: {
          presente: false,
          reuniao: {
            igreja: isSupervisorDaRede
              ? { redeId: rede.id }
              : { redeId: rede.id, liderId: currentUser.id },
          },
        },
        select: {
          id: true,
          motivo: true,
          user: { select: { id: true, name: true, avatarUrl: true } },
          reuniao: { select: { data: true, igreja: { select: { id: true, nome: true } } } },
        },
        orderBy: { reuniao: { data: "desc" } },
      })
    : [];

  const gruposFaltas = new Map<
    string,
    { igrejaNome: string; data: Date; itens: typeof faltas }
  >();
  for (const falta of faltas) {
    const chave = `${falta.reuniao.igreja.id}_${falta.reuniao.data.toISOString()}`;
    const grupo = gruposFaltas.get(chave);
    if (grupo) {
      grupo.itens.push(falta);
    } else {
      gruposFaltas.set(chave, {
        igrejaNome: falta.reuniao.igreja.nome,
        data: falta.reuniao.data,
        itens: [falta],
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />

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

      {pertenceARede && (
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
      )}

      {podeVerFaltas && (
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Faltas</h2>

          {gruposFaltas.size === 0 ? (
            <p className="text-sm text-white/50">Nenhuma falta registrada ainda.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {[...gruposFaltas.values()].map((grupo) => (
                <div
                  key={`${grupo.igrejaNome}_${grupo.data.toISOString()}`}
                  className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30"
                >
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    {grupo.igrejaNome}
                    <span className="ml-2 font-normal text-white/40">
                      {formatDataFalta(grupo.data)}
                    </span>
                  </h3>

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

          <Link
            href={`/relatorios-pdf/frequencia/${rede.id}`}
            target="_blank"
            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] px-5 py-4 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
              <CalendarIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">Exportar PDF</p>
              <p className="text-sm text-white/40">Relação de faltas do mês, pra imprimir ou salvar</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
