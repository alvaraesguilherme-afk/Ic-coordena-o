"use client";

import { useState, useTransition } from "react";
import { salvarEscalaCulto, removerEscalaCulto } from "@/app/actions/escala-culto";
import { nomeReduzido } from "@/lib/user";

export type CandidatoCulto = { id: string; nome: string };
export type EntradaCultoAtual = { id: string; escaladoId: string; nomeEscalado: string };

export function EscalaCultoDiaSlot({
  data,
  atual,
  candidatos,
  podeEditar,
}: {
  data: string;
  atual?: EntradaCultoAtual;
  candidatos: CandidatoCulto[];
  podeEditar: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  if (!podeEditar) {
    return atual ? (
      <span className="text-sm text-white">{nomeReduzido(atual.nomeEscalado)}</span>
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
            const escaladoId = e.target.value;
            setEditando(false);
            if (!escaladoId) return;
            setErro(undefined);
            startTransition(async () => {
              const res = await salvarEscalaCulto(data, escaladoId);
              if (res?.message) setErro(res.message);
            });
          }}
          onBlur={() => setEditando(false)}
          className="w-full max-w-[200px] rounded-lg border border-white/15 bg-white/95 px-2 py-1.5 text-xs text-black outline-none"
        >
          <option value="">Escolher pessoa...</option>
          {candidatos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
        {erro && <p className="text-xs text-red-300">{erro}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-white">{nomeReduzido(atual.nomeEscalado)}</span>
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
          onClick={() => startTransition(() => removerEscalaCulto(atual.id))}
          aria-label="Remover"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm leading-none text-white/30 hover:bg-white/10 hover:text-red-300 disabled:opacity-30"
        >
          ×
        </button>
      </div>
    </div>
  );
}
