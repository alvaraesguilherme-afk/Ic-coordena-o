"use client";

import { useTransition } from "react";
import { deletePlaylist } from "@/app/actions/playlists";
import { XIcon } from "@/components/icons";

export function DeletePlaylistButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        if (confirm("Remover esta playlist?")) {
          startTransition(() => deletePlaylist(id));
        }
      }}
      className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white/80 transition-colors hover:bg-red-500/90 hover:text-white disabled:opacity-60"
    >
      <XIcon className="h-3.5 w-3.5" />
    </button>
  );
}
