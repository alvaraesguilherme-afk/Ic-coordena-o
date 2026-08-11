import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ChurchIcon, CalendarIcon } from "@/components/icons";
import { TIPOS_ESCALA, ESCALA_TIPO_LABEL, type TipoEscala } from "@/lib/escalas";

export default async function InicioPage() {
  const [currentUser, redes, igrejas, proximasEscalas, participantes, membros] = await Promise.all([
    getUser(),
    prisma.rede.findMany({ orderBy: { nome: "asc" } }),
    prisma.igrejaCasa.findMany({ select: { redeId: true } }),
    prisma.escala.findMany({ where: { data: { gte: new Date() } }, orderBy: { data: "asc" } }),
    prisma.escalaParticipante.findMany({
      where: { escala: { data: { gte: new Date() } } },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const contagemPorRede = new Map<string, number>();
  for (const igreja of igrejas) {
    contagemPorRede.set(igreja.redeId, (contagemPorRede.get(igreja.redeId) ?? 0) + 1);
  }

  const nomePorUserId = new Map(membros.map((m) => [m.id, m.name]));
  const participantesPorEscala = new Map<string, string[]>();
  for (const p of participantes) {
    const nomes = participantesPorEscala.get(p.escalaId) ?? [];
    nomes.push(nomePorUserId.get(p.userId) ?? "");
    participantesPorEscala.set(p.escalaId, nomes);
  }

  const proximaPorTipo = new Map<TipoEscala, (typeof proximasEscalas)[number]>();
  for (const escala of proximasEscalas) {
    if (!proximaPorTipo.has(escala.tipo)) {
      proximaPorTipo.set(escala.tipo, escala);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-10 pt-2">
      <div>
        <p className="text-sm text-white/50">Bem-vindo(a) de volta,</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{currentUser.name}</h1>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Redes</h2>
          <Link href="/redes" className="text-sm text-yellow-300 hover:underline">
            {currentUser.role === "LIDER" ? "Gerenciar" : "Ver todas"}
          </Link>
        </div>

        {redes.length === 0 ? (
          <p className="text-sm text-white/50">Nenhuma rede cadastrada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {redes.map((rede) => (
              <Link
                key={rede.id}
                href={`/redes/${rede.id}`}
                className="flex aspect-square flex-col justify-between rounded-2xl border border-white/10 bg-white/[.05] p-4 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
                  <ChurchIcon className="h-5 w-5 text-yellow-100" />
                </div>
                <div>
                  <p className="font-medium text-white">{rede.nome}</p>
                  <p className="text-xs text-white/40">{contagemPorRede.get(rede.id) ?? 0} IC(s)</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Escalas</h2>
          <Link href="/escalas" className="text-sm text-yellow-300 hover:underline">
            Ver todas
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIPOS_ESCALA.map((tipo) => {
            if (tipo === "MIDIA") {
              const podeVerMidia =
                currentUser.isAdmin ||
                currentUser.role === "LIDER" ||
                currentUser.servoMidiaStatus === "APROVADO";
              if (!podeVerMidia) return null;

              return (
                <Link
                  key={tipo}
                  href="/escalas/midia"
                  className="rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
                    <CalendarIcon className="h-5 w-5 text-yellow-100" />
                  </div>
                  <p className="font-medium text-white">Escala de Mídia</p>
                  <p className="mt-1 text-sm text-white/50">Ver grade mensal</p>
                </Link>
              );
            }

            const escala = proximaPorTipo.get(tipo);
            return (
              <Link
                key={tipo}
                href={`/escalas?tipo=${tipo}`}
                className="rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
                  <CalendarIcon className="h-5 w-5 text-yellow-100" />
                </div>
                <p className="font-medium text-white">Escala de {ESCALA_TIPO_LABEL[tipo]}</p>
                {escala ? (
                  <>
                    <p className="mt-1 text-sm text-white/50">
                      {new Intl.DateTimeFormat("pt-BR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(escala.data)}
                    </p>
                    <p className="text-sm text-white/40">
                      {(participantesPorEscala.get(escala.id) ?? []).join(", ")}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-white/50">Nenhuma escala futura.</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
