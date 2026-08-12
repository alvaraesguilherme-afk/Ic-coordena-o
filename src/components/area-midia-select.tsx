"use client";

import { useState, useTransition } from "react";
import { adicionarAreaMidia, removerAreaMidia } from "@/app/actions/servo";
import { AREAS_MIDIA, AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";

export function AreaMidiaSelect({ userId, areas }: { userId: string; areas: AreaMidia[] }) {
  const [isPending, startTransition] = useTransition();
  const [adicionando, setAdicionando] = useState(false);
  const disponiveis = AREAS_MIDIA.filter((a) => !areas.includes(a));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {areas.map((area) => (
        <span
          key={area}
          className="flex items-center gap-1 rounded-full bg-white/10 py-1 pl-2.5 pr-1 text-xs text-white/70"
        >
          {AREA_MIDIA_LABEL[area]}
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => removerAreaMidia(userId, area))}
            aria-label={`Remover ${AREA_MIDIA_LABEL[area]}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base leading-none text-white/40 hover:bg-white/10 hover:text-red-300 disabled:opacity-60"
          >
            ×
          </button>
        </span>
      ))}

      {adicionando ? (
        <select
          autoFocus
          disabled={isPending}
          defaultValue=""
          onChange={(e) => {
            const area = e.target.value as AreaMidia;
            if (area) startTransition(() => adicionarAreaMidia(userId, area));
            setAdicionando(false);
          }}
          onBlur={() => setAdicionando(false)}
          className="rounded-full border border-white/15 bg-white/95 px-2.5 py-1.5 text-xs text-black outline-none"
        >
          <option value="">Escolher...</option>
          {disponiveis.map((a) => (
            <option key={a} value={a}>
              {AREA_MIDIA_LABEL[a]}
            </option>
          ))}
        </select>
      ) : (
        disponiveis.length > 0 && (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            aria-label="Adicionar área"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-base leading-none text-white/50 hover:border-yellow-400/40 hover:text-yellow-300"
          >
            +
          </button>
        )
      )}
    </div>
  );
}
