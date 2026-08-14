import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AvisoForm } from "@/components/aviso-form";
import { DeleteAvisoButton } from "@/components/delete-aviso-button";
import { PlaylistForm } from "@/components/playlist-form";
import { DeletePlaylistButton } from "@/components/delete-playlist-button";
import { CalendarIcon, MapPinIcon, MusicIcon } from "@/components/icons";
import { CATEGORIAS_LINK, CATEGORIA_LINK_LABEL, SLUG_POR_CATEGORIA_LINK, type CategoriaLink } from "@/lib/links";

const CAPA_POR_CATEGORIA: Partial<Record<CategoriaLink, string>> = {
  DRIVES_ESCOLA_IMPULSE: "/brand/escola-impulse-2026.jpg",
  MINISTRACOES: "/brand/ministracoes-2.jpg",
  EVENTOS: "/brand/eventos.jpg",
};

export default async function NovidadesPage() {
  const [currentUser, avisos, membros, playlists] = await Promise.all([
    getUser(),
    prisma.aviso.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { id: true, name: true } }),
    prisma.playlist.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const nomePorUserId = new Map(membros.map((m) => [m.id, m.name]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Mural</h1>

      <div className="grid grid-cols-3 gap-3">
        {CATEGORIAS_LINK.map((categoria) => {
          const capa = CAPA_POR_CATEGORIA[categoria];
          return (
            <Link
              key={categoria}
              href={`/links/${SLUG_POR_CATEGORIA_LINK[categoria]}`}
              className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-white/15 p-3 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
            >
              {capa ? (
                <>
                  <Image src={capa} alt="" fill className="object-cover" />
                  <div className="absolute inset-0 bg-[#0c1445]/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-white/[.09] to-white/[.02]" />
              )}
              <p className="relative z-10 text-sm font-medium text-white">
                {CATEGORIA_LINK_LABEL[categoria]}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-white">Playlists Impulse</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          <PlaylistForm />
          {playlists.map((playlist) => {
            const podeExcluir = currentUser.role === "LIDER" || playlist.autorId === currentUser.id;
            return (
              <a
                key={playlist.id}
                href={playlist.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-xl border border-white/15 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={playlist.capaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                {podeExcluir && <DeletePlaylistButton id={playlist.id} />}
                <p className="relative z-[1] flex items-center gap-1 p-2 text-xs font-medium text-white">
                  <MusicIcon className="h-3 w-3 shrink-0 text-yellow-300" />
                  <span className="truncate">{playlist.titulo}</span>
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {currentUser.role === "LIDER" && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <AvisoForm />
        </div>
      )}

      {avisos.length === 0 && <p className="text-sm text-white/50">Nada publicado ainda.</p>}

      <ul className="flex flex-col gap-4">
        {avisos.map((aviso) => (
          <li
            key={aviso.id}
            className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {aviso.dataEvento && (
                  <span className="mb-2 inline-block rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-300">
                    Evento
                  </span>
                )}
                <p className="font-medium text-white">{aviso.titulo}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{aviso.conteudo}</p>

                {(aviso.dataEvento || aviso.local) && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3">
                    {aviso.dataEvento && (
                      <p className="flex items-center gap-2 text-sm text-white/70">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-yellow-300" />
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(aviso.dataEvento)}
                      </p>
                    )}
                    {aviso.local && (
                      <p className="flex items-center gap-2 text-sm text-white/70">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-yellow-300" />
                        {aviso.local}
                      </p>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-white/40">
                  {nomePorUserId.get(aviso.autorId) ?? ""} ·{" "}
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                    aviso.createdAt
                  )}
                </p>
              </div>
              {currentUser.role === "LIDER" && <DeleteAvisoButton id={aviso.id} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
