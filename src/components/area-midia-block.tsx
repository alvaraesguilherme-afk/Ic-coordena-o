"use client";

import { useState, useTransition } from "react";
import { adicionarAreaMidia, removerAreaMidia, alterarNivelAreaMidia } from "@/app/actions/servo";
import { AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";

type Nivel = "TREINEIRO" | "VETERANO";
type Membro = { userId: string; nome: string; nivel: Nivel };
type Pessoa = { id: string; nome: string };

export function AreaMidiaBlock({
  area,
  membros,
  disponiveis,
}: {
  area: AreaMidia;
  membros: Membro[];
  disponiveis: Pessoa[];
}) {
  const [aberto, setAberto] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex flex-col items-start gap-0.5 rounded-xl border border-white/10 bg-white/[.05] px-3 py-2.5 text-left hover:border-yellow-400/30"
      >
        <span className="text-sm font-medium text-white">{AREA_MIDIA_LABEL[area]}</span>
        <span className="text-xs text-white/40">
          {membros.length} {membros.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </button>
    );
  }

  return (
    <div className="col-span-full flex flex-col gap-3 rounded-2xl border border-yellow-400/20 bg-white/[.05] p-4">
      <button
        type="button"
        onClick={() => setAberto(false)}
        className="flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-white">{AREA_MIDIA_LABEL[area]}</span>
        <span className="text-xs text-white/40">fechar</span>
      </button>

      {membros.length === 0 ? (
        <p className="text-sm text-white/40">Ninguém nessa área ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10">
          {membros.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-2 py-2">
              <span className="text-sm text-white">{m.nome}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => alterarNivelAreaMidia(m.userId, area))}
                  className={`rounded-full px-2.5 py-1 text-xs disabled:opacity-60 ${
                    m.nivel === "VETERANO" ? "bg-yellow-400/15 text-yellow-300" : "bg-white/10 text-white/60"
                  }`}
                >
                  {m.nivel === "VETERANO" ? "Veterano" : "Em treinamento"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => removerAreaMidia(m.userId, area))}
                  aria-label={`Remover ${m.nome} de ${AREA_MIDIA_LABEL[area]}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base leading-none text-white/30 hover:bg-white/10 hover:text-red-300 disabled:opacity-30"
                >
                  ×
                </button>
              </div>
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
            if (userId) startTransition(() => adicionarAreaMidia(userId, area));
            setAdicionando(false);
          }}
          onBlur={() => setAdicionando(false)}
          className="w-fit rounded-lg border border-white/15 bg-white/95 px-2 py-1.5 text-xs text-black outline-none"
        >
          <option value="">Escolher pessoa...</option>
          {disponiveis.map((pessoa) => (
            <option key={pessoa.id} value={pessoa.id}>
              {pessoa.nome}
            </option>
          ))}
        </select>
      ) : (
        disponiveis.length > 0 && (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="w-fit rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/50 hover:border-yellow-400/40 hover:text-yellow-300"
          >
            + adicionar pessoa
          </button>
        )
      )}
    </div>
  );
}
