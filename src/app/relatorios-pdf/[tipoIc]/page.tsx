import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ImprimirButton } from "@/components/imprimir-button";
import { sabadosDoMes, parseMesParam, mesLabel } from "@/lib/sabados";
import { TIPO_IC_POR_SLUG, ESCALA_TIPO_LABEL, campoSupervisorIc } from "@/lib/escalas";

function media(soma: number, quantidade: number) {
  return quantidade === 0 ? null : soma / quantidade;
}

function formatMedia(valor: number | null) {
  return valor === null ? "—" : valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

// Página solta, fora do grupo (app) de propósito — sem sidebar/cabeçalho do app,
// só o relatório mesmo, pra imprimir/salvar em PDF ficar limpo. Sem loading.tsx
// próprio (não faz parte da navegação por abas), então usa a mesma saída simples
// que /onboarding e / já usam.
export const instant = false;

export default async function RelatoriosPdfPage(props: PageProps<"/relatorios-pdf/[tipoIc]">) {
  const { tipoIc: slug } = await props.params;
  const tipo = TIPO_IC_POR_SLUG[slug];
  if (!tipo) {
    notFound();
  }

  const [currentUser, { mes: mesParam }] = await Promise.all([getUser(), props.searchParams]);
  const podeVer = currentUser.isAdmin || currentUser[campoSupervisorIc(tipo)];
  if (!podeVer) {
    notFound();
  }

  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const sabados = sabadosDoMes(ano, mes);
  const inicioMes = sabados[0] ?? new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const relatorios = await prisma.relatorioEscalaIc.findMany({
    where: { tipo, data: { gte: inicioMes, lt: fimMes } },
    orderBy: { data: "asc" },
  });

  const totalVisitantes = relatorios.reduce((soma, r) => soma + r.visitantes, 0);
  const totalPresentes = relatorios.reduce((soma, r) => soma + r.presentes, 0);
  const totalConvertidos = relatorios.reduce((soma, r) => soma + r.novosConvertidos, 0);
  const quantidade = relatorios.length;

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 text-[#111]">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-[#666]">Só quem supervisiona essa área vê essa página.</p>
        <ImprimirButton />
      </div>

      <header className="border-b-2 border-[#0c1445] pb-4">
        <p className="text-xs font-bold tracking-[0.14em] text-[#0c1445] uppercase">Impulse</p>
        <h1 className="text-2xl font-extrabold text-[#0c1445]">
          Relatórios de {ESCALA_TIPO_LABEL[tipo]} · {mesLabel(ano, mes)}
        </h1>
      </header>

      <section className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#ddd] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-[#888]">Média de visitantes / culto</p>
          <p className="mt-1 text-2xl font-extrabold text-[#0c1445]">
            {formatMedia(media(totalVisitantes, quantidade))}
          </p>
        </div>
        <div className="rounded-xl border border-[#ddd] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-[#888]">Média de presentes / culto</p>
          <p className="mt-1 text-2xl font-extrabold text-[#0c1445]">
            {formatMedia(media(totalPresentes, quantidade))}
          </p>
        </div>
        <div className="rounded-xl border border-[#ddd] p-4 text-center">
          <p className="text-[11px] uppercase tracking-wide text-[#888]">Média de convertidos / culto</p>
          <p className="mt-1 text-2xl font-extrabold text-[#0c1445]">
            {formatMedia(media(totalConvertidos, quantidade))}
          </p>
        </div>
      </section>

      {quantidade === 0 ? (
        <p className="text-sm text-[#666]">Nenhum relatório enviado nesse mês ainda.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[#0c1445] text-left text-[#0c1445]">
              <th className="py-2 pr-3">Dia</th>
              <th className="py-2 pr-3 text-right">Visitantes</th>
              <th className="py-2 pr-3 text-right">Presentes</th>
              <th className="py-2 text-right">Convertidos</th>
            </tr>
          </thead>
          <tbody>
            {relatorios.map((r) => (
              <tr key={r.id} className="border-b border-[#eee]">
                <td className="py-2 pr-3 capitalize">
                  {new Intl.DateTimeFormat("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    timeZone: "UTC",
                  }).format(r.data)}
                </td>
                <td className="py-2 pr-3 text-right">{r.visitantes}</td>
                <td className="py-2 pr-3 text-right">{r.presentes}</td>
                <td className="py-2 text-right">{r.novosConvertidos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </div>
  );
}
