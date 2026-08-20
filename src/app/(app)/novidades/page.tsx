import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AvisoForm } from "@/components/aviso-form";
import { DeleteAvisoButton } from "@/components/delete-aviso-button";
import { CalendarIcon, MapPinIcon } from "@/components/icons";
import { CATEGORIAS_LINK, SLUG_POR_CATEGORIA_LINK, type CategoriaLink } from "@/lib/links";

// Mural de cortiça — cada polaroid/adesivo é um PNG recortado (fita, boneco
// LEGO e sombra já vêm desenhados na própria imagem), posicionado por
// porcentagem em cima do fundo "public/brand/mural/fundo.jpg". Mesmo esquema
// do TIJOLO_ESCALA/REDES_CLUSTER em /inicio: percentuais medidos em cima do
// mockup que o Guilherme mandou, não uma grade.
const POLAROID_POR_CATEGORIA: Record<
  CategoriaLink,
  { src: string; left: number; top: number; width: number; imgWidth: number; imgHeight: number }
> = {
  DRIVES_ESCOLA_IMPULSE: {
    src: "/brand/mural/drives.png",
    left: 8,
    top: 12,
    width: 40,
    imgWidth: 748,
    imgHeight: 829,
  },
  MINISTRACOES: {
    src: "/brand/mural/ministracoes.png",
    left: 52,
    top: 26,
    width: 42,
    imgWidth: 913,
    imgHeight: 849,
  },
};

// A antiga categoria "Eventos" virou a área "Programação" — mesma posição
// do mural, mas agora leva pra uma publicação com campos todo opcionais
// (igual avisos), em vez de uma lista de links.
const PROGRAMACAO_POLAROID = {
  src: "/brand/mural/programacao.png",
  left: 10,
  top: 48,
  width: 42,
  imgWidth: 728,
  imgHeight: 758,
};

export default async function NovidadesPage() {
  const currentUser = await getUser();
  const agora = new Date();

  const [avisos, membros] = await Promise.all([
    prisma.aviso.findMany({
      where: { OR: [{ expiraEm: null }, { expiraEm: { gte: agora } }] },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const nomePorUserId = new Map(membros.map((m) => [m.id, m.name]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Mural</h1>

      <div className="relative -mx-6 sm:-mx-10" style={{ aspectRatio: "2132 / 3079" }}>
        <Image src="/brand/mural/quadro.png" alt="" fill className="object-contain object-top" priority />

        {CATEGORIAS_LINK.map((categoria) => {
          const polaroid = POLAROID_POR_CATEGORIA[categoria];
          return (
            <Link
              key={categoria}
              href={`/links/${SLUG_POR_CATEGORIA_LINK[categoria]}`}
              className="absolute drop-shadow-xl transition-transform hover:scale-[1.03] active:scale-95"
              style={{ left: `${polaroid.left}%`, top: `${polaroid.top}%`, width: `${polaroid.width}%` }}
            >
              <Image
                src={polaroid.src}
                alt=""
                width={polaroid.imgWidth}
                height={polaroid.imgHeight}
                className="h-auto w-full"
              />
            </Link>
          );
        })}

        <Link
          href="/novidades/programacao"
          className="absolute drop-shadow-xl transition-transform hover:scale-[1.03] active:scale-95"
          style={{
            left: `${PROGRAMACAO_POLAROID.left}%`,
            top: `${PROGRAMACAO_POLAROID.top}%`,
            width: `${PROGRAMACAO_POLAROID.width}%`,
          }}
        >
          <Image
            src={PROGRAMACAO_POLAROID.src}
            alt=""
            width={PROGRAMACAO_POLAROID.imgWidth}
            height={PROGRAMACAO_POLAROID.imgHeight}
            className="h-auto w-full"
          />
        </Link>

        <Link
          href="/novidades/playlists"
          className="absolute drop-shadow-xl transition-transform hover:scale-[1.03] active:scale-95"
          style={{ left: "56%", top: "66%", width: "32%" }}
        >
          <Image
            src="/brand/mural/playlist.png"
            alt="Playlists"
            width={623}
            height={503}
            className="h-auto w-full"
          />
        </Link>
      </div>

      {/* Avisos viram notas de verdade: mesmo PNG (public/brand/mural/avisos.png)
          como pele de cada cartão, esticado via background-size 100% 100% (não
          <Image fill>) porque a altura de cada aviso varia — capa, link, texto
          longo. O papel é claro, então o texto aqui é escuro, ao contrário do
          resto do app. */}
      {currentUser.role === "LIDER" && (
        <div
          className="bg-[length:100%_100%] bg-no-repeat px-[7%] pt-[13%] pb-[7%] drop-shadow-lg"
          style={{ backgroundImage: "url(/brand/mural/avisos.png)" }}
        >
          <AvisoForm />
        </div>
      )}

      {avisos.length === 0 && currentUser.role !== "LIDER" && (
        <div
          className="flex min-h-40 items-start justify-center bg-[length:100%_100%] bg-no-repeat px-[7%] pt-[15%] drop-shadow-lg"
          style={{ backgroundImage: "url(/brand/mural/avisos.png)" }}
        >
          <p className="text-sm text-[#444]">Nenhum aviso por enquanto...</p>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {avisos.map((aviso) => {
          const corpo = (
            <>
              {aviso.capaUrl && (
                <div className="relative aspect-[16/9] w-full">
                  <Image src={aviso.capaUrl} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-col px-[7%] pt-[13%] pb-[7%]">
                {aviso.dataEvento && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-semibold text-[#0c1445]">
                    Evento
                  </span>
                )}
                {aviso.titulo && <p className="font-medium text-[#1a1a1a]">{aviso.titulo}</p>}
                <p className="mt-1 whitespace-pre-wrap text-sm text-[#333]">{aviso.conteudo}</p>

                {(aviso.dataEvento || aviso.local) && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-black/10 pt-3">
                    {aviso.dataEvento && (
                      <p className="flex items-center gap-2 text-sm text-[#333]">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-red-600" />
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(aviso.dataEvento)}
                      </p>
                    )}
                    {aviso.local && (
                      <p className="flex items-center gap-2 text-sm text-[#333]">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-red-600" />
                        {aviso.local}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-[#777]">
                  {nomePorUserId.get(aviso.autorId) ?? ""} ·{" "}
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                    aviso.createdAt
                  )}
                </p>
              </div>
            </>
          );

          return (
            <li
              key={aviso.id}
              className="relative flex flex-col bg-[length:100%_100%] bg-no-repeat drop-shadow-lg"
              style={{ backgroundImage: "url(/brand/mural/avisos.png)" }}
            >
              {currentUser.role === "LIDER" && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                  <DeleteAvisoButton id={aviso.id} />
                </div>
              )}
              {aviso.link ? (
                <a
                  href={aviso.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col transition-transform active:scale-[0.98]"
                >
                  {corpo}
                </a>
              ) : (
                corpo
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
