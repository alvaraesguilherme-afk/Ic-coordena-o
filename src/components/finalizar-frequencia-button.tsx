"use client";

import { useState, useTransition } from "react";
import { finalizarFrequencia } from "@/app/actions/frequencia";
import { CheckIcon } from "@/components/icons";

export function FinalizarFrequenciaButton({
  igrejaId,
  dataStr,
  finalizadaInicial,
  travada,
}: {
  igrejaId: string;
  dataStr: string;
  finalizadaInicial: boolean;
  travada: boolean;
}) {
  const [finalizada, setFinalizada] = useState(finalizadaInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (travada) return null;

  if (finalizada) {
    return (
      <p className="flex items-center gap-2 self-start rounded-full bg-green-500/15 px-4 py-2 text-sm font-medium text-green-300">
        <CheckIcon className="h-4 w-4" />
        Frequência enviada
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setErro(null);
          startTransition(async () => {
            const result = await finalizarFrequencia(igrejaId, dataStr);
            if (result?.message && result.message !== "success") {
              setErro(result.message);
            } else {
              setFinalizada(true);
            }
          });
        }}
        className="w-fit self-start rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Finalizar frequência"}
      </button>
      {erro && <p className="text-xs text-red-300">{erro}</p>}
    </div>
  );
}
