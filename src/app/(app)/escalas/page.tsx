import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteEscalaButton } from "@/components/delete-escala-button";
import { BackLink } from "@/components/back-link";
import { GerenciarSupervisorButton } from "@/components/gerenciar-supervisor-button";
import { CalendarIcon } from "@/components/icons";
import { FUNCAO_MIDIA_LABEL } from "@/lib/funcoes-midia";
import { TIPOS_ESCALA_CRIAVEIS, ESCALA_TIPO_LABEL, type TipoEscala } from "@/lib/escalas";

export default async function EscalasPage(props: PageProps<"/escalas">) {
  const [currentUser, { tipo: tipoParam }] = await Promise.all([getUser(), props.searchParams]);

  if (tipoParam === "MIDIA") {
    redirect("/escalas/midia");
  }

  const [escalas, participantes, membros] = await Promise.all([
    prisma.escala.findMany({ orderBy: { data: "desc" } }),
    prisma.escalaParticipante.findMany(),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const podeVerMidia =
    currentUser.isAdmin ||
    currentUser.role === "LIDER" ||
    currentUser.servoMidiaStatus === "APROVADO";

  const tipoFiltro = (TIPOS_ESCALA_CRIAVEIS as readonly string[]).includes(tipoParam as string)
    ? (tipoParam as TipoEscala)
    : undefined;

  const tipos = tipoFiltro ? [tipoFiltro] : TIPOS_ESCALA_CRIAVEIS;

  const podeAprovarServo =
    currentUser.role === "LIDER" && (currentUser.isAdmin || currentUser.redeId !== null);

  const servosAprovados = podeAprovarServo && !tipoFiltro
    ? await prisma.user.findMany({
        where: {
          servoMidiaStatus: "APROVADO",
          ...(!currentUser.isAdmin && {
            OR: [{ redeId: currentUser.redeId }, { igreja: { redeId: currentUser.redeId! } }],
          }),
        },
        select: {
          id: true,
          name: true,
          supervisorMidia: true,
          areasServoMidia: { select: { area: true } },
        },
        orderBy: { name: "asc" },
      })
    : [];

  const nomePorUserId = new Map(membros.map((m) => [m.id, m.name]));
  const participantesPorEscala = new Map<string, string[]>();
  for (const p of participantes) {
    const nomes = participantesPorEscala.get(p.escalaId) ?? [];
    nomes.push(nomePorUserId.get(p.userId) ?? "");
    participantesPorEscala.set(p.escalaId, nomes);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {tipoFiltro ? `Escala de ${ESCALA_TIPO_LABEL[tipoFiltro]}` : "Escalas"}
        </h1>
      </div>

      {!tipoFiltro && podeVerMidia && (
        <Link
          href="/escalas/midia"
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
            <CalendarIcon className="h-5 w-5 text-yellow-100" />
          </div>
          <div>
            <p className="font-medium text-white">Escala de Mídia</p>
            <p className="text-sm text-white/50">Grade mensal por área, todos os sábados</p>
          </div>
        </Link>
      )}

      {servosAprovados.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Servos de mídia aprovados
          </h2>
          <ul className="flex flex-col divide-y divide-white/10">
            {servosAprovados.map((pessoa) => (
              <li key={pessoa.id} className="flex items-center justify-between gap-3 py-3">
                <p className="text-sm text-white">
                  {pessoa.name}
                  {pessoa.areasServoMidia.length > 0 && (
                    <span className="text-white/40">
                      {" "}
                      · {pessoa.areasServoMidia.map((a) => FUNCAO_MIDIA_LABEL[a.area]).join(", ")}
                    </span>
                  )}
                </p>
                <GerenciarSupervisorButton userId={pessoa.id} supervisor={pessoa.supervisorMidia} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between">
        {currentUser.role === "LIDER" && (
          <Link
            href={tipoFiltro ? `/escalas/nova?tipo=${tipoFiltro}` : "/escalas/nova"}
            className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445]"
          >
            + Nova escala
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-10">
        {tipos.map((tipo) => {
          const doTipo = escalas.filter((escala) => escala.tipo === tipo);
          return (
            <section key={tipo} className="flex flex-col gap-4">
              {!tipoFiltro && (
                <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                  Escala de {ESCALA_TIPO_LABEL[tipo]}
                </h2>
              )}

              {doTipo.length === 0 ? (
                <p className="text-sm text-white/50">Nenhuma escala cadastrada ainda.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-white/10">
                  {doTipo.map((escala) => (
                    <li key={escala.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-white">
                          {new Intl.DateTimeFormat("pt-BR", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(escala.data)}
                        </p>
                        <p className="text-sm text-white/50">
                          {(participantesPorEscala.get(escala.id) ?? []).join(", ")}
                        </p>
                        {escala.observacao && (
                          <p className="mt-1 text-sm text-white/40">{escala.observacao}</p>
                        )}
                      </div>
                      {currentUser.role === "LIDER" && <DeleteEscalaButton id={escala.id} />}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
