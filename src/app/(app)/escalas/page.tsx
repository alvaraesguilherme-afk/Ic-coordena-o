import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteEscalaButton } from "@/components/delete-escala-button";
import { BackLink } from "@/components/back-link";
import { AprovarServoButton } from "@/components/aprovar-servo-button";
import { TIPOS_ESCALA, ESCALA_TIPO_LABEL, type TipoEscala } from "@/lib/escalas";

export default async function EscalasPage(props: PageProps<"/escalas">) {
  const [currentUser, { tipo: tipoParam }, escalas, participantes, membros] = await Promise.all([
    getUser(),
    props.searchParams,
    prisma.escala.findMany({ orderBy: { data: "desc" } }),
    prisma.escalaParticipante.findMany(),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const podeVerMidia =
    currentUser.isAdmin ||
    currentUser.role === "LIDER" ||
    currentUser.servoMidiaStatus === "APROVADO";

  const tipoFiltro = TIPOS_ESCALA.includes(tipoParam as TipoEscala)
    ? (tipoParam as TipoEscala)
    : undefined;

  if (tipoFiltro === "MIDIA" && !podeVerMidia) {
    redirect("/escalas");
  }

  const tipos = tipoFiltro
    ? [tipoFiltro]
    : TIPOS_ESCALA.filter((tipo) => tipo !== "MIDIA" || podeVerMidia);

  const podeAprovarServo =
    currentUser.role === "LIDER" && (currentUser.isAdmin || currentUser.redeId !== null);

  const pedidosPendentes =
    podeAprovarServo && (tipoFiltro === "MIDIA" || !tipoFiltro)
      ? await prisma.user.findMany({
          where: {
            servoMidiaStatus: "PENDENTE",
            ...(!currentUser.isAdmin && {
              OR: [{ redeId: currentUser.redeId }, { igreja: { redeId: currentUser.redeId! } }],
            }),
          },
          select: { id: true, name: true },
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

      {pedidosPendentes.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/[.06] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-yellow-300">
            Pedidos pra servir na mídia ({pedidosPendentes.length})
          </h2>
          <ul className="flex flex-col divide-y divide-white/10">
            {pedidosPendentes.map((pessoa) => (
              <li key={pessoa.id} className="flex items-center justify-between py-3">
                <p className="text-sm text-white">{pessoa.name}</p>
                <AprovarServoButton userId={pessoa.id} />
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
