import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { AREAS_MIDIA, AREA_MIDIA_LABEL } from "@/lib/areas-midia";
import { sabadosDoMes, dataKey, parseMesParam, mesAnterior, mesSeguinte, mesLabel } from "@/lib/sabados";
import { ArrowLeftIcon } from "@/components/icons";

export default async function GradeMidiaPage(props: PageProps<"/escalas/midia">) {
  const currentUser = await getUser();

  const podeVer =
    currentUser.isAdmin || currentUser.role === "LIDER" || currentUser.servoMidiaStatus === "APROVADO";
  if (!podeVer) {
    redirect("/escalas");
  }
  const podeEditar = currentUser.isAdmin || currentUser.supervisorMidia;

  const { mes: mesParam } = await props.searchParams;
  const { ano, mes } = parseMesParam(typeof mesParam === "string" ? mesParam : undefined);
  const sabados = sabadosDoMes(ano, mes);

  const inicioMes = sabados[0] ?? new Date(Date.UTC(ano, mes - 1, 1));
  const fimMes = new Date(Date.UTC(ano, mes, 1));

  const entradas = await prisma.escalaMidiaEntrada.findMany({
    where: { data: { gte: inicioMes, lt: fimMes } },
    include: { escalado: { select: { name: true } }, treinando: { select: { name: true } } },
  });

  const entradaPorCelula = new Map<string, (typeof entradas)[number]>();
  for (const entrada of entradas) {
    entradaPorCelula.set(`${entrada.area}_${dataKey(entrada.data)}`, entrada);
  }

  const anterior = mesAnterior(ano, mes);
  const seguinte = mesSeguinte(ano, mes);
  const mesAtualStr = `${ano}-${String(mes).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" fixedDestination />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white capitalize">
          Grade de mídia · {mesLabel(ano, mes)}
        </h1>
      </div>

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
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[.05] backdrop-blur-xl">
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
                          <Link
                            href={podeEditar ? href : "#"}
                            className={`flex flex-col gap-0.5 ${podeEditar ? "hover:underline" : "pointer-events-none"}`}
                          >
                            <span className="text-white">{entrada.escalado.name}</span>
                            {entrada.treinando && (
                              <span className="text-xs text-yellow-300/80">
                                treinando: {entrada.treinando.name}
                              </span>
                            )}
                          </Link>
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
      )}
    </div>
  );
}
