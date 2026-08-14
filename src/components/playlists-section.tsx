"use client";

import { useState } from "react";
import { PlaylistForm } from "@/components/playlist-form";
import { DeletePlaylistButton } from "@/components/delete-playlist-button";
import { ChevronDownIcon, MusicIcon } from "@/components/icons";
import { iconePlataforma } from "@/lib/playlists";

type Playlist = {
  id: string;
  titulo: string;
  url: string;
  capaUrl: string;
  autorId: string;
};

export function PlaylistsSection({
  playlists,
  currentUserId,
  isLider,
}: {
  playlists: Playlist[];
  currentUserId: string;
  isLider: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <MusicIcon className="h-4 w-4 shrink-0 text-yellow-300" />
          <span className="text-lg font-semibold text-white">Playlists Impulse</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/60">
            {playlists.length}
          </span>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="grid grid-cols-3 gap-3 p-4 pt-0 sm:grid-cols-4">
          <PlaylistForm />
          {playlists.map((playlist) => {
            const podeExcluir = isLider || playlist.autorId === currentUserId;
            const icone = iconePlataforma(playlist.url);
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
                  {icone ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={icone} alt="" className="h-3.5 w-3.5 shrink-0 rounded-full" />
                  ) : (
                    <MusicIcon className="h-3 w-3 shrink-0 text-yellow-300" />
                  )}
                  <span className="truncate">{playlist.titulo}</span>
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
