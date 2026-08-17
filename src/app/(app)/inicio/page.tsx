import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ChurchIcon, CakeIcon } from "@/components/icons";
import { SLUG_POR_TIPO_IC, type TipoEscalaIc } from "@/lib/escalas";
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

// Substituiu os emojis flutuantes por ícones de verdade da marca (pasta que o
// Guilherme mandou, 2026-08-16) — mesmas posições medidas em cima do
// painel-redes.png de antes.
const DECORACOES_REDES_CLUSTER = [
  { src: "/brand/decoracoes/logo-impulse.png", left: 25.4, top: 12.25, big: true },
  { src: "/brand/decoracoes/bandeira-azul.png", left: 79.8, top: 13.85, big: true },
  { src: "/brand/decoracoes/radio.png", left: 94.15, top: 54.95, xl: true },
  { src: "/brand/decoracoes/disco.png", left: 21.65, top: 88.75 },
  { src: "/brand/decoracoes/dado.png", left: 40.8, top: 33 },
  { src: "/brand/decoracoes/logo-retangular.png", left: 58, top: 70.6 },
];

// "escalas/fundo.png" é a arte final do Guilherme (bandeira + xadrez + banner dos bonecos)
// — o meio do arco branco é espaço vazio de propósito, os tijolos flutuam soltos ali dentro
// numa grade responsiva (não posições fixas), pra caber 2, 3 ou 4 sem sobrar buraco.
const TIJOLO_ESCALA: Record<
  TipoEscalaIc | "MIDIA" | "CULTO",
  { href: string; src: string; imgWidth: number; imgHeight: number; alt: string }
> = {
  MIDIA: {
    href: "/escalas/midia",
    src: "/brand/escalas/midia.png",
    imgWidth: 914,
    imgHeight: 534,
    alt: "Escala de Mídia — ver escala mensal",
  },
  INTEGRACAO: {
    href: `/escalas/${SLUG_POR_TIPO_IC.INTEGRACAO}`,
    src: "/brand/escalas/integracao.png",
    imgWidth: 940,
    imgHeight: 590,
    alt: "Escala de Integração — ver escala mensal",
  },
  INTERCESSAO: {
    href: `/escalas/${SLUG_POR_TIPO_IC.INTERCESSAO}`,
    src: "/brand/escalas/intercessao.png",
    imgWidth: 925,
    imgHeight: 558,
    alt: "Escala de Intercessão — ver escala mensal",
  },
  CULTO: {
    href: "/escalas/culto",
    src: "/brand/escalas/culto.png",
    imgWidth: 1044,
    imgHeight: 610,
    alt: "Direção de Culto — ver escala mensal",
  },
};

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
    <div className="flex w-full flex-1 flex-col gap-10 pt-2">
      <div>
        <p className="text-sm text-white/50">Bem-vindo(a) de volta,</p>
        <h1 className="text-lg font-semibold tracking-tight text-white">{currentUser.name}</h1>
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
            {DECORACOES_REDES_CLUSTER.map((d, i) => (
              <span
                key={d.src}
                aria-hidden
                // Tamanho fixo aqui (não só na imagem): esse span é absolute sem
                // "right", perto da borda direita do aglomerado (left: 94%+) — sem
                // largura própria, ele encolhe pro espacinho que sobra até a borda,
                // e o max-width:100% padrão de imagem prende a foto nesse tamanho
                // errado, não importa a classe passada pro <Image>.
                className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none ${
                  d.xl
                    ? "h-14 w-14 sm:h-16 sm:w-16"
                    : d.big
                      ? "h-10 w-10 sm:h-12 sm:w-12"
                      : "h-7 w-7 sm:h-9 sm:w-9"
                }`}
                style={{ left: `${d.left}%`, top: `${d.top}%` }}
              >
                <Image
                  src={d.src}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="brick-float h-full w-full object-contain drop-shadow"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
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
                    <Image src={capa} alt={nome} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[.09] to-white/[.02]">
                      <ChurchIcon className="h-6 w-6 text-yellow-100" />
                      <span className="sr-only">{nome}</span>
                    </div>
                  )}
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
          const podeVerCulto =
            currentUser.isAdmin || currentUser.supervisorDirecaoCulto || currentUser.autorizadoDirecaoCulto;

          const tijolosVisiveis: { tipo: keyof typeof TIJOLO_ESCALA; badge?: number }[] = [
            ...(podeVerMidia ? [{ tipo: "MIDIA" as const, badge: pedidosMidiaPendentes }] : []),
            { tipo: "INTEGRACAO" as const },
            { tipo: "INTERCESSAO" as const },
            ...(podeVerCulto ? [{ tipo: "CULTO" as const }] : []),
          ];

          return (
            <div className="relative mx-auto w-full max-w-md" style={{ aspectRatio: "1878 / 2345" }}>
              <Image
                src="/brand/escalas/fundo.png"
                alt="Escalas. Você faz parte disso!"
                fill
                className="object-contain object-top"
                priority
              />

              {/* Área vazia do arco branco (medida na arte) — os tijolos flutuam numa
                  grade de 2 colunas aqui dentro, então 2, 3 ou 4 blocos sempre se
                  distribuem sem deixar buraco, não importa quantos cada um vê. */}
              <div
                className="absolute inset-x-[6%] grid grid-cols-2 content-center items-center gap-x-3 gap-y-4"
                style={{ top: "19%", height: "48%" }}
              >
                {tijolosVisiveis.map(({ tipo, badge }, i) => {
                  const tijolo = TIJOLO_ESCALA[tipo];
                  return (
                    <Link
                      key={tipo}
                      href={tijolo.href}
                      className="brick-float relative"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      {!!badge && badge > 0 && (
                        <span className="absolute -right-2 -top-2 z-10 flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-400 px-1.5 text-xs font-bold text-[#0c1445] shadow-lg shadow-black/30">
                          {badge}
                        </span>
                      )}
                      <Image
                        src={tijolo.src}
                        alt={tijolo.alt}
                        width={tijolo.imgWidth}
                        height={tijolo.imgHeight}
                        className="h-auto w-full drop-shadow-xl"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}
