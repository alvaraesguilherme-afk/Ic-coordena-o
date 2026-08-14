import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { GerenciarSupervisorButton } from "@/components/gerenciar-supervisor-button";
import { SupervisorIcManager } from "@/components/supervisor-ic-manager";
import { CalendarIcon } from "@/components/icons";
import { FUNCAO_MIDIA_LABEL } from "@/lib/funcoes-midia";
import { SLUG_POR_TIPO_IC, ESCALA_TIPO_LABEL } from "@/lib/escalas";

export default async function EscalasPage() {
  const currentUser = await getUser();

  const podeVerMidia = currentUser.isAdmin || currentUser.servoMidiaStatus === "APROVADO";
  const podeAprovarMidia = currentUser.isAdmin || currentUser.supervisorMidia;

  const podeGerenciarSupervisores = currentUser.role === "LIDER";

  const [servosAprovados, lideres, pedidosMidiaPendentes] = await Promise.all([
    podeGerenciarSupervisores
      ? prisma.user.findMany({
          where: { servoMidiaStatus: "APROVADO" },
          select: {
            id: true,
            name: true,
            supervisorMidia: true,
            areasServoMidia: { select: { area: true } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    podeGerenciarSupervisores
      ? prisma.user.findMany({
          where: { role: "LIDER" },
          select: { id: true, name: true, supervisorIntegracao: true, supervisorIntercessao: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    podeAprovarMidia
      ? prisma.user.count({ where: { servoMidiaStatus: "PENDENTE" } })
      : Promise.resolve(0),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Escalas</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {podeVerMidia && (
          <Link
            href="/escalas/midia"
            className="relative rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
          >
            {pedidosMidiaPendentes > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-lg shadow-black/30">
                {pedidosMidiaPendentes}
              </span>
            )}
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
              <CalendarIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <p className="font-medium text-white">Escala de Mídia</p>
            <p className="mt-1 text-sm text-white/50">Ver grade mensal</p>
          </Link>
        )}

        {(["INTEGRACAO", "INTERCESSAO"] as const).map((tipo) => (
          <Link
            key={tipo}
            href={`/escalas/${SLUG_POR_TIPO_IC[tipo]}`}
            className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
              <CalendarIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <p className="font-medium text-white">Escala de {ESCALA_TIPO_LABEL[tipo]}</p>
            <p className="mt-1 text-sm text-white/50">Ver grade mensal</p>
          </Link>
        ))}
      </div>

      {podeGerenciarSupervisores && (
        <div className="flex flex-col gap-4">
          {servosAprovados.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30">
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

          <SupervisorIcManager
            tipo="INTEGRACAO"
            label={ESCALA_TIPO_LABEL.INTEGRACAO}
            supervisores={lideres.filter((l) => l.supervisorIntegracao)}
            candidatos={lideres.filter((l) => !l.supervisorIntegracao)}
          />

          <SupervisorIcManager
            tipo="INTERCESSAO"
            label={ESCALA_TIPO_LABEL.INTERCESSAO}
            supervisores={lideres.filter((l) => l.supervisorIntercessao)}
            candidatos={lideres.filter((l) => !l.supervisorIntercessao)}
          />
        </div>
      )}
    </div>
  );
}
