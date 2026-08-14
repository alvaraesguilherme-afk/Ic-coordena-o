import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ChurchIcon, CalendarIcon, CakeIcon } from "@/components/icons";
import { SLUG_POR_TIPO_IC, ESCALA_TIPO_LABEL, type TipoEscalaIc } from "@/lib/escalas";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { nomeReduzido } from "@/lib/user";
import { CAPA_POR_REDE } from "@/lib/redes-capas";

function listaComE(nomes: string[]) {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

// Posições medidas pixel a pixel em cima do painel-redes.png que o Guilherme mandou,
// pra reproduzir exatamente aquele aglomerado de bolhas (não uma grade).
const REDES_CLUSTER: Record<string, { left: number; top: number; size: number }> = {
  Bonaerges: { left: 35.3, top: 0, size: 32.5 },
  Zion: { left: 6, top: 19.6, size: 29 },
  "Águias Metanoia": { left: 33.8, top: 36.4, size: 33.5 },
  Maranata: { left: 67.5, top: 23.1, size: 29 },
  "Noivas Ataviadas": { left: 0, top: 49.4, size: 33.3 },
  Siloé: { left: 63, top: 58.4, size: 33.5 },
  Peregrinas: { left: 31.3, top: 73.7, size: 29.3 },
};

const EMOJIS_REDES_CLUSTER = [
  { emoji: "😎", left: 25.4, top: 12.25 },
  { emoji: "😄", left: 79.8, top: 13.85 },
  { emoji: "😆", left: 94.15, top: 54.95 },
  { emoji: "😉", left: 21.65, top: 88.75 },
  { emoji: "✌️", left: 40.8, top: 33 },
  { emoji: "🔥", left: 58, top: 70.6 },
];

const BOTAO_ESCALA_IC: Record<TipoEscalaIc, { src: string; width: number; height: number }> = {
  INTEGRACAO: { src: "/brand/escalas/integracao.png", width: 940, height: 590 },
  INTERCESSAO: { src: "/brand/escalas/intercessao.png", width: 925, height: 558 },
};

// Posições dos botões dentro da própria "caixa de escalas.png" (a área branca sólida
// abaixo da bandeira), escalonados como na foto de referência.
const POSICAO_BOTAO_ESCALA = {
  MIDIA: { left: 15, top: 56, width: 32 },
  INTEGRACAO: { left: 53, top: 68, width: 34 },
  INTERCESSAO: { left: 13, top: 80, width: 34 },
} as const;

export default async function InicioPage() {
  const [currentUser, redesBrutas, pessoasComAniversario] = await Promise.all([
    getUser(),
    prisma.rede.findMany(),
    prisma.user.findMany({
      where: { birthDate: { not: null } },
      select: { id: true, name: true, avatarUrl: true, birthDate: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const podeAprovarMidia = currentUser.isAdmin || currentUser.supervisorMidia;
  const pedidosMidiaPendentes = podeAprovarMidia
    ? await prisma.user.count({ where: { servoMidiaStatus: "PENDENTE" } })
    : 0;

  const redes = [...redesBrutas].sort((a, b) =>
    redeNomeSemPrefixo(a.nome).localeCompare(redeNomeSemPrefixo(b.nome), "pt-BR", {
      sensitivity: "base",
    })
  );

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
    <div className="brand-checker-bg-maroon -mx-6 flex w-full flex-1 flex-col gap-10 rounded-3xl px-6 py-8 shadow-lg shadow-black/40 sm:-mx-10 sm:px-10">
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
          <div className="relative mx-auto w-full max-w-md" style={{ aspectRatio: "1594 / 1774" }}>
            {EMOJIS_REDES_CLUSTER.map((e) => (
              <span
                key={e.emoji + e.left}
                aria-hidden
                className="pointer-events-none absolute hidden -translate-x-1/2 -translate-y-1/2 select-none text-3xl drop-shadow sm:block"
                style={{ left: `${e.left}%`, top: `${e.top}%` }}
              >
                {e.emoji}
              </span>
            ))}

            {redes.map((rede) => {
              const nome = redeNomeSemPrefixo(rede.nome);
              const pos = REDES_CLUSTER[nome];
              if (!pos) return null;
              const capa = CAPA_POR_REDE[nome];
              return (
                <Link
                  key={rede.id}
                  href={`/redes/${rede.id}`}
                  className="absolute overflow-hidden rounded-full border border-white/15 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
                  style={{ left: `${pos.left}%`, top: `${pos.top}%`, width: `${pos.size}%`, aspectRatio: "1 / 1" }}
                >
                  {capa ? (
                    <>
                      <Image src={capa} alt="" fill className="object-cover" />
                      <div className="absolute inset-0 bg-[#0c1445]/35" />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[.09] to-white/[.02]">
                      <ChurchIcon className="h-6 w-6 text-yellow-100" />
                    </div>
                  )}
                  <p className="absolute inset-x-0 bottom-[16%] px-2 text-center text-sm font-medium text-white drop-shadow sm:text-base">
                    {nome}
                  </p>
                </Link>
              );
            })}

            {redes.some((r) => !REDES_CLUSTER[redeNomeSemPrefixo(r.nome)]) && (
              <div className="absolute inset-x-0 top-full mt-4 flex flex-wrap justify-center gap-3">
                {redes
                  .filter((r) => !REDES_CLUSTER[redeNomeSemPrefixo(r.nome)])
                  .map((rede) => (
                    <Link
                      key={rede.id}
                      href={`/redes/${rede.id}`}
                      className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition-colors hover:border-yellow-400/40"
                    >
                      {redeNomeSemPrefixo(rede.nome)}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center justify-between">
          <h2 className="sr-only">Escalas</h2>
          <span />
          <Link href="/escalas" className="text-sm text-yellow-300 hover:underline">
            Ver todas
          </Link>
        </div>

        {(() => {
          const podeVerMidia = currentUser.isAdmin || currentUser.servoMidiaStatus === "APROVADO";

          return (
            <div className="relative mx-auto w-full max-w-md" style={{ aspectRatio: "1927 / 2400" }}>
              {/* xadrez do fundo mostrando através de um véu branco, recortado no formato
                  real da caixa.png (usada aqui só como máscara de silhueta) — é assim que
                  a foto de referência fica: xadrez visível "por trás" do branco, não opaco. */}
              <div
                className="absolute inset-0 bg-white/80"
                style={{
                  WebkitMaskImage: "url(/brand/escalas/caixa.png)",
                  maskImage: "url(/brand/escalas/caixa.png)",
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />

              <div
                className="absolute"
                style={{ left: "18.58%", top: "6.6%", width: "62.6%" }}
              >
                <Image
                  src="/brand/escalas/flag.png"
                  alt="Escalas"
                  width={1207}
                  height={311}
                  className="h-auto w-full"
                  priority
                />
              </div>

              {podeVerMidia && (
                <Link
                  href="/escalas/midia"
                  className="absolute transition-transform hover:-translate-y-1"
                  style={{
                    left: `${POSICAO_BOTAO_ESCALA.MIDIA.left}%`,
                    top: `${POSICAO_BOTAO_ESCALA.MIDIA.top}%`,
                    width: `${POSICAO_BOTAO_ESCALA.MIDIA.width}%`,
                  }}
                >
                  {pedidosMidiaPendentes > 0 && (
                    <span className="absolute -right-2 -top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-[#0c1445] shadow-lg shadow-black/30">
                      {pedidosMidiaPendentes}
                    </span>
                  )}
                  <Image
                    src="/brand/escalas/midia.png"
                    alt="Escala de Mídia — ver escala mensal"
                    width={914}
                    height={534}
                    className="h-auto w-full"
                  />
                </Link>
              )}

              {(["INTEGRACAO", "INTERCESSAO"] as const).map((tipo) => {
                const botao = BOTAO_ESCALA_IC[tipo];
                const pos = POSICAO_BOTAO_ESCALA[tipo];
                return (
                  <Link
                    key={tipo}
                    href={`/escalas/${SLUG_POR_TIPO_IC[tipo]}`}
                    className="absolute transition-transform hover:-translate-y-1"
                    style={{ left: `${pos.left}%`, top: `${pos.top}%`, width: `${pos.width}%` }}
                  >
                    <Image
                      src={botao.src}
                      alt={`Escala de ${ESCALA_TIPO_LABEL[tipo]} — ver escala mensal`}
                      width={botao.width}
                      height={botao.height}
                      className="h-auto w-full"
                    />
                  </Link>
                );
              })}
            </div>
          );
        })()}
      </section>

      {currentUser.isAdmin && (
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Frequência</h2>

          <Link
            href="/frequencia"
            className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
              <CalendarIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <div>
              <p className="font-medium text-white">Frequência das ICs</p>
              <p className="mt-1 text-sm text-white/50">Ver listas de presença</p>
            </div>
          </Link>
        </section>
      )}

      <div className="mx-auto w-full max-w-2xl">
        <Image
          src="/brand/boas-vindas.png"
          alt="Você faz parte disso!"
          width={1975}
          height={957}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
