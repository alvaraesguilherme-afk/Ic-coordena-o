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
  dataLabel,
}: {
  entradaId: string;
  currentUserId: string;
  isEscalado: boolean;
  souVeteranoNaArea: boolean;
  permutaAberta?: PermutaAberta;
  dataLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<"abrir" | "aceitar" | null>(null);

  if (isEscalado) {
    if (permutaAberta && permutaAberta.solicitanteId === currentUserId) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-semibold text-yellow-300">Permuta pendente</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const res = await cancelarPermuta(permutaAberta.id);
              setErro(res?.message ?? null);
            })}
            className="text-xs text-white/40 hover:text-red-300 disabled:opacity-50"
          >
            cancelar
          </button>
          {erro && <span className="text-xs text-red-300">{erro}</span>}
        </div>
      );
    }

    if (!permutaAberta) {
      if (confirmando === "abrir") {
        return (
          <div className="flex flex-col items-start gap-1">
            <span className="max-w-[8rem] text-xs text-white/70">
              Pedir permuta pro dia {dataLabel}?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await abrirPermuta(entradaId);
                    setErro(res?.message ?? null);
                    setConfirmando(null);
                  })
                }
                className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1 text-xs font-bold text-[#0c1445] disabled:opacity-50"
              >
                {isPending ? "..." : "Sim"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirmando(null)}
                className="text-xs text-white/40 hover:text-white/70"
              >
                Cancelar
              </button>
            </div>
            {erro && <span className="text-xs text-red-300">{erro}</span>}
          </div>
        );
      }

      return (
        <div className="flex flex-col items-start gap-0.5">
          <button
            type="button"
            onClick={() => setConfirmando("abrir")}
            className="text-xs text-white/40 hover:text-yellow-300"
          >
            pedir permuta
          </button>
          {erro && <span className="text-xs text-red-300">{erro}</span>}
        </div>
      );
    }

    return null;
  }

  if (permutaAberta && souVeteranoNaArea) {
    if (confirmando === "aceitar") {
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="max-w-[8rem] text-xs text-white/70">
            Aceitar permuta do dia {dataLabel}?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const res = await aceitarPermuta(permutaAberta.id);
                  setErro(res?.message ?? null);
                  setConfirmando(null);
                })
              }
              className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1 text-xs font-bold text-[#0c1445] disabled:opacity-50"
            >
              {isPending ? "..." : "Sim"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirmando(null)}
              className="text-xs text-white/40 hover:text-white/70"
            >
              Cancelar
            </button>
          </div>
          {erro && <span className="text-xs text-red-300">{erro}</span>}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-1">
        <span className="text-xs font-semibold text-yellow-300">Precisa de permuta</span>
        <button
          type="button"
          onClick={() => setConfirmando("aceitar")}
          className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1 text-xs font-bold text-[#0c1445] disabled:opacity-50"
        >
          Aceitar
        </button>
        {erro && <span className="text-xs text-red-300">{erro}</span>}
      </div>
    );
  }

  return null;
}
