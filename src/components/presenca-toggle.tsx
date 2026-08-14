"use client";

import { useState, useTransition } from "react";
import { marcarPresenca } from "@/app/actions/frequencia";

export function PresencaToggle({
  igrejaId,
  dataStr,
  membroId,
  presenteInicial,
}: {
  igrejaId: string;
  dataStr: string;
  membroId: string;
  presenteInicial: boolean;
}) {
  const [checked, setChecked] = useState(presenteInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isPending}
        onClick={() => {
          const next = !checked;
          setChecked(next);
          setErro(null);
          startTransition(async () => {
            const result = await marcarPresenca(igrejaId, dataStr, membroId, next);
            if (result?.message) {
              setChecked(!next);
              setErro(result.message);
            }
          });
        }}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          checked ? "bg-yellow-400" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      {erro && <p className="max-w-[10rem] text-right text-xs text-red-300">{erro}</p>}
    </div>
  );
}
