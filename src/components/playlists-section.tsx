"use client";

import { useState } from "react";
import { PlaylistForm } from "@/components/playlist-form";
import { PlaylistCard } from "@/components/playlist-card";
import { ChevronDownIcon, MusicIcon } from "@/components/icons";

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
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              id={playlist.id}
              titulo={playlist.titulo}
              url={playlist.url}
              capaUrl={playlist.capaUrl}
              podeExcluir={isLider || playlist.autorId === currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
