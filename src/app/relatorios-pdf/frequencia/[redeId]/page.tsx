import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ImprimirButton } from "@/components/imprimir-button";
import { parseMesParam, mesAnterior, mesSeguinte, mesLabel } from "@/lib/sabados";
import { formatDataFalta } from "@/lib/frequencia";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { nomesIguais } from "@/lib/user";

// Página solta, fora do grupo (app), mesmo tratamento de "@/app/relatorios-pdf/[tipoIc]" —
// sem sidebar/cabeçalho do app, só o relatório pra imprimir/salvar em PDF.
export const instant = false;

export default async function RelatorioPdfFrequenciaPage(
  props: PageProps<"/relatorios-pdf/frequencia/[redeId]">
) {
  const [{ redeId }, { mes: mesParam }, currentUser] = await Promise.all([
    props.params,
    props.searchParams,
    getUser(),
  ]);

  const [rede, igrejas] = await Promise.all([
    prisma.rede.findUnique({ where: { id: redeId } }),
    prisma.igrejaCasa.findMany({
      where: { redeId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, liderId: true },
    }),
  ]);

  if (!rede) {
    notFound();
  }

  // Mesma regra de acesso da seção "Faltas" em /redes/[id]: o supervisor da rede
  // vê tudo, um líder de IC só a(s) sua(s) — mas aqui, se não for supervisor,
  // o relatório fica restrito às ICs que ele lidera dentro dessa rede.
  const isSupervisorDaRede =
    currentUser.isAdmin || (currentUser.role === "LIDER" && nomesIguais(rede.liderNome, currentUser.name));
  const igrejasVisiveis = isSupervisorDaRede
    ? igrejas
    : igrejas.filter((i) => i.liderId === currentUser.id);

  if (igrejasVisiveis.length === 0) {
    notFound();
  }

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const inicioMes = new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));
  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);

  const faltas = await prisma.presenca.findMany({
    where: {
      presente: false,
      reuniao: {
        data: { gte: inicioMes, lt: fimMes },
        igrejaId: { in: igrejasVisiveis.map((i) => i.id) },
      },
    },
    select: {
      id: true,
      motivo: true,
      user: { select: { name: true } },
      reuniao: { select: { data: true, igreja: { select: { id: true, nome: true } } } },
    },
    orderBy: [{ reuniao: { data: "asc" } }],
  });

  const gruposPorIc = new Map<
    string,
    { igrejaNome: string; itens: { data: Date; nome: string; motivo: string | null }[] }
  >();
  for (const falta of faltas) {
    const chave = falta.reuniao.igreja.id;
    const item = { data: falta.reuniao.data, nome: falta.user.name, motivo: falta.motivo };
    const grupo = gruposPorIc.get(chave);
    if (grupo) {
      grupo.itens.push(item);
    } else {
      gruposPorIc.set(chave, { igrejaNome: falta.reuniao.igreja.nome, itens: [item] });
    }
  }
  const grupos = [...gruposPorIc.values()].sort((a, b) =>
    a.igrejaNome.localeCompare(b.igrejaNome, "pt-BR")
  );

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 text-[#111]">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <p className="text-sm text-[#666]">Só quem supervisiona essa rede vê essa página.</p>
          <ImprimirButton />
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <Link
            href={`/relatorios-pdf/frequencia/${redeId}?mes=${anterior.ano}-${String(anterior.mes).padStart(2, "0")}`}
            className="rounded-full border border-[#ddd] px-3 py-1.5 text-sm text-[#444] hover:bg-[#f5f5f5]"
          >
            ← Mês anterior
          </Link>
          <Link
            href={`/relatorios-pdf/frequencia/${redeId}?mes=${seguinte.ano}-${String(seguinte.mes).padStart(2, "0")}`}
            className="rounded-full border border-[#ddd] px-3 py-1.5 text-sm text-[#444] hover:bg-[#f5f5f5]"
          >
            Próximo mês →
          </Link>
        </div>

        <header className="border-b-2 border-[#0c1445] pb-4">
          <p className="text-xs font-bold tracking-[0.14em] text-[#0c1445] uppercase">Impulse</p>
          <h1 className="text-2xl font-extrabold text-[#0c1445]">
            Faltas · {redeNomeSemPrefixo(rede.nome)} · {mesLabel(ano, mes)}
          </h1>
          <p className="mt-1 text-sm text-[#666]">
            {faltas.length} {faltas.length === 1 ? "falta registrada" : "faltas registradas"} no mês
          </p>
        </header>

        {grupos.length === 0 ? (
          <p className="text-sm text-[#666]">Nenhuma falta registrada nesse mês.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {grupos.map((grupo) => (
              <section key={grupo.igrejaNome} className="break-inside-avoid">
                <h2 className="mb-2 text-lg font-bold text-[#0c1445]">{grupo.igrejaNome}</h2>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#0c1445] text-left text-[#0c1445]">
                      <th className="py-2 pr-3">Dia</th>
                      <th className="py-2 pr-3">Nome</th>
                      <th className="py-2">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.itens.map((item, i) => (
                      <tr key={`${item.nome}_${item.data.toISOString()}_${i}`} className="border-b border-[#eee]">
                        <td className="py-2 pr-3 whitespace-nowrap capitalize">{formatDataFalta(item.data)}</td>
                        <td className="py-2 pr-3">{item.nome}</td>
                        <td className="py-2 text-[#666]">{item.motivo || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
