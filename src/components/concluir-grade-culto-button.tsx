"use client";

import { useState, useTransition } from "react";
import { concluirGradeCulto } from "@/app/actions/escala-culto";
import { CheckIcon } from "@/components/icons";

export function ConcluirGradeCultoButton({ ano, mes }: { ano: number; mes: number }) {
  const [isPending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm("Concluir a grade e notificar todo mundo escalado neste mês?")) return;
          setResultado(null);
          startTransition(async () => {
            const res = await concluirGradeCulto(ano, mes);
            setResultado(
              res.message === "success"
                ? `Notificações enviadas para ${res.total} pessoa${res.total === 1 ? "" : "s"}.`
                : (res.message ?? null),
            );
          });
        }}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        <CheckIcon className="h-4 w-4" />
        {isPending ? "Concluindo..." : "Concluir grade"}
      </button>
      {resultado && <p className="text-xs text-white/50">{resultado}</p>}
    </div>
  );
}
