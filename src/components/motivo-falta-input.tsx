"use client";

import { useState, useTransition } from "react";
import { salvarMotivoFalta } from "@/app/actions/faltas";

export function MotivoFaltaInput({
  presencaId,
  motivoInicial,
}: {
  presencaId: string;
  motivoInicial: string | null;
}) {
  const [valor, setValor] = useState(motivoInicial ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        placeholder="Motivo (opcional)"
        value={valor}
        disabled={isPending}
        onChange={(event) => setValor(event.target.value)}
        onBlur={() => {
          setErro(null);
          startTransition(async () => {
            const result = await salvarMotivoFalta(presencaId, valor);
            if (result?.message) {
              setErro(result.message);
            }
          });
        }}
        className="w-full rounded-lg border border-white/15 bg-white/[.04] px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:border-yellow-400/40 focus:outline-none disabled:opacity-60"
      />
      {erro && <p className="text-xs text-red-300">{erro}</p>}
    </div>
  );
}
