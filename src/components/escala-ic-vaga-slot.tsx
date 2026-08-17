"use client";

import { useState, useTransition } from "react";
import { salvarEscalaIc, removerEscalaIc } from "@/app/actions/escala-ic";
import { nomeReduzido } from "@/lib/user";
import type { TipoEscalaIc } from "@/lib/escalas";

export type CandidatoIc = { liderId: string; nomeLider: string; nomeIc: string };
export type EntradaAtual = { id: string; liderId: string; nomeLider: string; nomeIc: string };

export function EscalaIcVagaSlot({
  tipo,
  data,
  vaga,
  atual,
  candidatos,
  podeEditar,
  meuLiderId,
}: {
  tipo: TipoEscalaIc;
  data: string;
  vaga: 1 | 2;
  atual?: EntradaAtual;
  candidatos: CandidatoIc[];
  podeEditar: boolean;
  meuLiderId?: string | null;
}) {
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const ehMeuJeitoDeServir = !!atual && !!meuLiderId && atual.liderId === meuLiderId;

  if (!podeEditar) {
    return atual ? (
      <div className="flex flex-col">
        <span
          className={`text-sm text-white ${ehMeuJeitoDeServir ? "w-fit rounded-full border border-yellow-400 px-2 py-0.5" : ""}`}
        >
          {nomeReduzido(atual.nomeLider)}
        </span>
        <span className="text-xs text-white/40">{atual.nomeIc}</span>
      </div>
    ) : (
      <span className="text-sm text-white/30">—</span>
    );
  }

  if (editando || !atual) {
    return (
      <div className="flex flex-col gap-1">
        <select
          autoFocus={editando}
          disabled={isPending}
          defaultValue=""
          onChange={(e) => {
            const liderId = e.target.value;
            setEditando(false);
            if (!liderId) return;
            setErro(undefined);
            startTransition(async () => {
              const res = await salvarEscalaIc(tipo, data, vaga, liderId);
              if (res?.message) setErro(res.message);
            });
          }}
          onBlur={() => setEditando(false)}
          className="w-full max-w-[170px] rounded-lg border border-white/15 bg-white/95 px-2 py-1.5 text-xs text-black outline-none"
        >
          <option value="">Escolher líder...</option>
          {candidatos.map((c) => (
            <option key={c.liderId} value={c.liderId}>
              {c.nomeLider} · {c.nomeIc}
            </option>
          ))}
        </select>
        {erro && <p className="text-xs text-red-300">{erro}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <span
          className={`text-sm text-white ${ehMeuJeitoDeServir ? "w-fit rounded-full border border-yellow-400 px-2 py-0.5" : ""}`}
        >
          {nomeReduzido(atual.nomeLider)}
        </span>
        <span className="text-xs text-white/40">{atual.nomeIc}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="text-xs text-white/40 hover:text-yellow-300"
        >
          trocar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => removerEscalaIc(atual.id, tipo))}
          aria-label="Remover"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm leading-none text-white/30 hover:bg-white/10 hover:text-red-300 disabled:opacity-30"
        >
          ×
        </button>
      </div>
    </div>
  );
}
