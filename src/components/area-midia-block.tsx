"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { adicionarAreaMidia, removerAreaMidia, alterarNivelAreaMidia } from "@/app/actions/servo";
import { FUNCAO_MIDIA_LABEL, type FuncaoMidia } from "@/lib/funcoes-midia";
import { PersonIcon } from "@/components/icons";

type Nivel = "TREINEIRO" | "VETERANO";
type Membro = { userId: string; nome: string; avatarUrl: string | null; nivel: Nivel };
type Pessoa = { id: string; nome: string };

export function AreaMidiaBlock({
  area,
  membros,
  disponiveis,
  podeEditar,
  voltarHref,
}: {
  area: FuncaoMidia;
  membros: Membro[];
  disponiveis: Pessoa[];
  podeEditar: boolean;
  voltarHref: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex flex-col items-start gap-0.5 rounded-xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] px-3 py-2.5 text-left shadow-md shadow-black/30 hover:border-yellow-400/30"
      >
        <span className="text-sm font-medium text-white">{FUNCAO_MIDIA_LABEL[area]}</span>
        <span className="text-xs text-white/40">
          {membros.length} {membros.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </button>
    );
  }

  return (
    <div className="col-span-full flex flex-col gap-3 rounded-2xl border border-yellow-400/25 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30">
      <button
        type="button"
        onClick={() => setAberto(false)}
        className="flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-white">{FUNCAO_MIDIA_LABEL[area]}</span>
        <span className="text-xs text-white/40">fechar</span>
      </button>

      {membros.length === 0 ? (
        <p className="text-sm text-white/40">Ninguém nessa área ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/10">
          {membros.map((m) => (
            <li key={m.userId} className="flex items-center justify-between gap-2 py-2">
              <Link
                href={`/membros/${m.userId}?voltar=${encodeURIComponent(voltarHref)}`}
                className="flex min-w-0 items-center gap-2 hover:underline"
              >
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/10">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PersonIcon className="h-full w-full p-1.5 text-white/40" />
                  )}
                </div>
                <span className="truncate text-sm text-white">{m.nome}</span>
              </Link>
              <div className="flex items-center gap-1.5">
                {podeEditar ? (
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
                ) : (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      m.nivel === "VETERANO" ? "bg-yellow-400/15 text-yellow-300" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {m.nivel === "VETERANO" ? "Veterano" : "Em treinamento"}
                  </span>
                )}
                {podeEditar && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => startTransition(() => removerAreaMidia(m.userId, area))}
                    aria-label={`Remover ${m.nome} de ${FUNCAO_MIDIA_LABEL[area]}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base leading-none text-white/30 hover:bg-white/10 hover:text-red-300 disabled:opacity-30"
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {podeEditar &&
        (adicionando ? (
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
        ))}
    </div>
  );
}
