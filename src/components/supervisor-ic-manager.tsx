"use client";

import { useState, useTransition } from "react";
import { promoverSupervisorIc, removerSupervisorIc } from "@/app/actions/escala-ic";
import type { TipoEscalaIc } from "@/lib/escalas";

type Pessoa = { id: string; name: string };

export function SupervisorIcManager({
  tipo,
  label,
  supervisores,
  candidatos,
}: {
  tipo: TipoEscalaIc;
  label: string;
  supervisores: Pessoa[];
  candidatos: Pessoa[];
}) {
  const [adicionando, setAdicionando] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
        Supervisor{supervisores.length !== 1 ? "es" : ""} de {label}
      </h2>

      {supervisores.length === 0 ? (
        <p className="text-sm text-white/40">Ninguém designado ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10">
          {supervisores.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-white">{p.name}</span>
              <button
                type="button"
                disabled={isPending}
                onClick={() => startTransition(() => removerSupervisorIc(p.id, tipo))}
                className="shrink-0 rounded-full bg-yellow-400/20 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:bg-yellow-400/30 disabled:opacity-60"
              >
                remover
              </button>
            </li>
          ))}
        </ul>
      )}

      {adicionando ? (
        <select
          autoFocus
          disabled={isPending}
          defaultValue=""
          onChange={(e) => {
            const userId = e.target.value;
            setAdicionando(false);
            if (userId) startTransition(() => promoverSupervisorIc(userId, tipo));
          }}
          onBlur={() => setAdicionando(false)}
          className="w-fit rounded-lg border border-white/15 bg-white/95 px-2 py-1.5 text-xs text-black outline-none"
        >
          <option value="">Escolher líder...</option>
          {candidatos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      ) : (
        candidatos.length > 0 && (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/50 hover:border-yellow-400/40 hover:text-yellow-300"
          >
            + adicionar supervisor
          </button>
        )
      )}
    </div>
  );
}
