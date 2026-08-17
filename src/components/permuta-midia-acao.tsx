"use client";

import { useState, useTransition } from "react";
import { abrirPermuta, cancelarPermuta, aceitarPermuta } from "@/app/actions/permuta-midia";

export type PermutaAberta = { id: string; solicitanteId: string; solicitanteNome: string };

export function PermutaMidiaAcao({
  entradaId,
  currentUserId,
  isEscalado,
  souVeteranoNaArea,
  permutaAberta,
}: {
  entradaId: string;
  currentUserId: string;
  isEscalado: boolean;
  souVeteranoNaArea: boolean;
  permutaAberta?: PermutaAberta;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  if (isEscalado) {
    if (permutaAberta && permutaAberta.solicitanteId === currentUserId) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-semibold text-yellow-300">Permuta pendente</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const res = await cancelarPermuta(permutaAberta.id);
              setErro(res?.message ?? null);
            })}
            className="text-[10px] text-white/40 hover:text-red-300 disabled:opacity-50"
          >
            cancelar
          </button>
          {erro && <span className="text-[10px] text-red-300">{erro}</span>}
        </div>
      );
    }

    if (!permutaAberta) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const res = await abrirPermuta(entradaId);
              setErro(res?.message ?? null);
            })}
            className="text-[10px] text-white/40 hover:text-yellow-300 disabled:opacity-50"
          >
            {isPending ? "..." : "pedir permuta"}
          </button>
          {erro && <span className="text-[10px] text-red-300">{erro}</span>}
        </div>
      );
    }

    return null;
  }

  if (permutaAberta && souVeteranoNaArea) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[10px] font-semibold text-yellow-300">Precisa de permuta</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => {
            const res = await aceitarPermuta(permutaAberta.id);
            setErro(res?.message ?? null);
          })}
          className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[10px] font-bold text-[#0c1445] disabled:opacity-50"
        >
          {isPending ? "..." : "Aceitar"}
        </button>
        {erro && <span className="text-[10px] text-red-300">{erro}</span>}
      </div>
    );
  }

  return null;
}
