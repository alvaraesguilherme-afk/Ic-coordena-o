"use client";

import { useRef, useState, useTransition, type MouseEvent, type PointerEvent } from "react";
import { deletePlaylist } from "@/app/actions/playlists";
import { MusicIcon } from "@/components/icons";
import { iconePlataforma } from "@/lib/playlists";

const LONG_PRESS_MS = 500;
const MOVE_TOLERANCE = 10;

export function PlaylistCard({
  id,
  titulo,
  url,
  capaUrl,
  podeExcluir,
}: {
  id: string;
  titulo: string;
  url: string;
  capaUrl: string;
  podeExcluir: boolean;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const icone = iconePlataforma(url);

  function limparTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLAnchorElement>) {
    if (!podeExcluir) return;
    startRef.current = { x: event.clientX, y: event.clientY };
    longPressRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressRef.current = true;
      setMenuAberto(true);
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(event: PointerEvent<HTMLAnchorElement>) {
    const dx = Math.abs(event.clientX - startRef.current.x);
    const dy = Math.abs(event.clientY - startRef.current.y);
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) limparTimer();
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (longPressRef.current) {
      event.preventDefault();
      longPressRef.current = false;
    }
  }

  function handleDelete() {
    startTransition(async () => {
      await deletePlaylist(id);
      setMenuAberto(false);
    });
  }

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={limparTimer}
        onPointerLeave={limparTimer}
        onPointerCancel={limparTimer}
        onContextMenu={(event) => podeExcluir && event.preventDefault()}
        onClick={handleClick}
        className="group relative block aspect-square touch-manipulation select-none transition-transform active:scale-95"
      >
        <div className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-xl border border-white/15 shadow-lg shadow-black/30 transition-colors group-hover:border-yellow-400/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={capaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <p className="relative z-[1] truncate p-2 text-xs font-medium text-white">{titulo}</p>
        </div>

        {icone ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={icone}
            alt=""
            className="absolute -top-2 -left-2 z-[2] h-8 w-8 rounded-full border-2 border-[#0c1445] shadow-lg shadow-black/40"
          />
        ) : (
          <div className="absolute -top-2 -left-2 z-[2] flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0c1445] bg-[#131a44] shadow-lg shadow-black/40">
            <MusicIcon className="h-4 w-4 text-yellow-300" />
          </div>
        )}
      </a>

      {menuAberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setMenuAberto(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl border-t border-white/15 bg-[#131a44] p-4 pb-6 shadow-2xl sm:rounded-2xl sm:border"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="mb-3 truncate px-1 text-sm font-medium text-white/60">{titulo}</p>
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="w-full rounded-xl bg-red-500/15 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-60"
            >
              {isPending ? "Excluindo..." : "Excluir playlist"}
            </button>
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              className="mt-2 w-full rounded-xl border border-white/15 py-3 text-sm text-white/70 transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
