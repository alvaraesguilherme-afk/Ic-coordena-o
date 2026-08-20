import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ArrowLeftIcon, CakeIcon, CalendarIcon } from "@/components/icons";
import {
  parseMesParam,
  mesAnterior,
  mesSeguinte,
  mesLabel,
  diasDoMes,
  diaDaSemanaDoPrimeiro,
} from "@/lib/calendario";
import { redeNomeSemPrefixo } from "@/lib/igrejas";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

type Item = {
  dia: number;
  tipo: "evento" | "aniversario";
  titulo: string;
  id: string;
  redeNome: string;
};

export default async function CalendarioGeralPage(props: PageProps<"/configuracoes/calendario">) {
  const { mes: mesParam } = await props.searchParams;
  const currentUser = await getUser();

  if (!currentUser.isAdmin) {
    redirect("/configuracoes");
  }

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const dias = diasDoMes(ano, mes);
  const inicioMes = dias[0];
  const fimMes = new Date(Date.UTC(ano, mes, 1));
  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);

  const [eventos, pessoas] = await Promise.all([
    prisma.evento.findMany({
      where: { data: { gte: inicioMes, lt: fimMes } },
      include: { rede: { select: { nome: true } } },
      orderBy: { data: "asc" },
    }),
    prisma.user.findMany({
      where: { birthDate: { not: null } },
      select: {
        id: true,
        name: true,
        birthDate: true,
        rede: { select: { nome: true } },
        igreja: { select: { rede: { select: { nome: true } } } },
      },
    }),
  ]);

  const itensPorDia = new Map<number, Item[]>();
  for (const evento of eventos) {
    const dia = evento.data.getUTCDate();
    const lista = itensPorDia.get(dia) ?? [];
    lista.push({
      dia,
      tipo: "evento",
      titulo: evento.titulo,
      id: evento.id,
      redeNome: redeNomeSemPrefixo(evento.rede.nome),
    });
    itensPorDia.set(dia, lista);
  }

  for (const pessoa of pessoas) {
    if (!pessoa.birthDate || pessoa.birthDate.getUTCMonth() !== mes - 1) continue;
    const dia = pessoa.birthDate.getUTCDate();
    const redeNome = pessoa.rede?.nome ?? pessoa.igreja?.rede?.nome;
    const lista = itensPorDia.get(dia) ?? [];
    lista.push({
      dia,
      tipo: "aniversario",
      titulo: pessoa.name,
      id: pessoa.id,
      redeNome: redeNome ? redeNomeSemPrefixo(redeNome) : "Sem rede",
    });
    itensPorDia.set(dia, lista);
  }

  const itensOrdenados = [...itensPorDia.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([, itens]) => itens);

  const leadingBlanks = diaDaSemanaDoPrimeiro(ano, mes);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/configuracoes" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Calendário Geral</h1>
      <p className="-mt-4 text-sm text-white/50">
        Eventos e aniversários de todas as redes, juntos num lugar só.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href={`/configuracoes/calendario?mes=${anterior.ano}-${String(anterior.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Anterior
        </Link>
        <p className="flex-1 text-center text-sm font-semibold capitalize text-white/80">
          {mesLabel(ano, mes)}
        </p>
        <Link
          href={`/configuracoes/calendario?mes=${seguinte.ano}-${String(seguinte.mes).padStart(2, "0")}`}
          className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
        >
          Próximo
          <ArrowLeftIcon className="h-4 w-4 rotate-180" />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-white/40">
          {DIAS_SEMANA.map((letra, i) => (
            <span key={i}>{letra}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {dias.map((data) => {
            const dia = data.getUTCDate();
            const itens = itensPorDia.get(dia) ?? [];
            const temEvento = itens.some((i) => i.tipo === "evento");
            const temAniversario = itens.some((i) => i.tipo === "aniversario");
            return (
              <div
                key={dia}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg text-sm text-white/80"
              >
                <span>{dia}</span>
                {(temEvento || temAniversario) && (
                  <span className="flex gap-0.5">
                    {temEvento && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
                    {temAniversario && <span className="h-1.5 w-1.5 rounded-full bg-pink-300/70" />}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Nesse mês</h2>

        {itensOrdenados.length === 0 ? (
          <p className="text-sm text-white/50">Nada marcado pra esse mês ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
            {itensOrdenados.map((item, i) => (
              <li key={`${item.tipo}-${item.id}-${i}`} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.tipo === "aniversario"
                      ? "bg-gradient-to-br from-pink-400/30 to-yellow-400/30"
                      : "bg-gradient-to-br from-red-500/30 to-yellow-400/30"
                  }`}
                >
                  {item.tipo === "aniversario" ? (
                    <CakeIcon className="h-4 w-4 text-pink-100" />
                  ) : (
                    <CalendarIcon className="h-4 w-4 text-yellow-100" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{item.titulo}</p>
                  <p className="text-xs text-white/40">
                    {item.redeNome} · {item.tipo === "aniversario" ? "Aniversário" : "Evento"} · dia{" "}
                    {item.dia}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
