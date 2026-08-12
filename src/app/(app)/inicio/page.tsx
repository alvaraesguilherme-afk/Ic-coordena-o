import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ChurchIcon, CalendarIcon, CakeIcon } from "@/components/icons";
import { SLUG_POR_TIPO_IC, ESCALA_TIPO_LABEL } from "@/lib/escalas";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { nomeReduzido } from "@/lib/user";

function listaComE(nomes: string[]) {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

export default async function InicioPage() {
  const [currentUser, redes, igrejas, pessoasComAniversario] = await Promise.all([
    getUser(),
    prisma.rede.findMany({ orderBy: { nome: "asc" } }),
    prisma.igrejaCasa.findMany({ select: { redeId: true } }),
    prisma.user.findMany({
      where: { birthDate: { not: null } },
      select: { id: true, name: true, avatarUrl: true, birthDate: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const contagemPorRede = new Map<string, number>();
  for (const igreja of igrejas) {
    contagemPorRede.set(igreja.redeId, (contagemPorRede.get(igreja.redeId) ?? 0) + 1);
  }

  const hoje = new Date();
  const aniversariantes = pessoasComAniversario.filter(
    (p) =>
      p.birthDate!.getUTCMonth() === hoje.getUTCMonth() &&
      p.birthDate!.getUTCDate() === hoje.getUTCDate()
  );
  const souEuTambem = aniversariantes.some((p) => p.id === currentUser.id);
  const outrosNomes = aniversariantes
    .filter((p) => p.id !== currentUser.id)
    .map((p) => nomeReduzido(p.name));

  return (
    <div className="flex w-full flex-1 flex-col gap-10 pt-2">
      <div>
        <p className="text-sm text-white/50">Bem-vindo(a) de volta,</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{currentUser.name}</h1>
      </div>

      {aniversariantes.length > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-pink-400/25 bg-gradient-to-b from-pink-400/[.12] to-yellow-400/[.04] p-4 shadow-lg shadow-black/30">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400/30 to-yellow-400/30">
            <CakeIcon className="h-6 w-6 text-pink-100" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex -space-x-3">
              {aniversariantes.map((p) => (
                <Link
                  key={p.id}
                  href={`/membros/${p.id}`}
                  className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-[#0c1445] bg-white/10"
                >
                  {p.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatarUrl} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-sm text-white">
              {souEuTambem && outrosNomes.length === 0 && "Hoje é o seu aniversário! 🎉"}
              {souEuTambem && outrosNomes.length > 0 && (
                <>Hoje é o seu aniversário e também de {listaComE(outrosNomes)}! 🎉</>
              )}
              {!souEuTambem && <>Hoje é aniversário de {listaComE(outrosNomes)}! 🎂</>}
            </p>
          </div>
        </div>
      )}

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
                className="flex aspect-square flex-col justify-between rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
                  <ChurchIcon className="h-5 w-5 text-yellow-100" />
                </div>
                <div>
                  <p className="font-medium text-white">{redeNomeSemPrefixo(rede.nome)}</p>
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
          {(() => {
            const podeVerMidia =
              currentUser.isAdmin ||
              currentUser.role === "LIDER" ||
              currentUser.servoMidiaStatus === "APROVADO";

            return (
              <>
                {podeVerMidia && (
                  <Link
                    href="/escalas/midia"
                    className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
                  >
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
                    className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
                      <CalendarIcon className="h-5 w-5 text-yellow-100" />
                    </div>
                    <p className="font-medium text-white">Escala de {ESCALA_TIPO_LABEL[tipo]}</p>
                    <p className="mt-1 text-sm text-white/50">Ver grade mensal</p>
                  </Link>
                ))}
              </>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
