"use client";

import { useTransition } from "react";
import { solicitarServoMidia } from "@/app/actions/servo";

export function SolicitarServoButton({
  status,
}: {
  status: "NENHUM" | "PENDENTE" | "APROVADO";
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "APROVADO") {
    return (
      <span className="rounded-full bg-yellow-400/20 px-3 py-1.5 text-xs font-bold text-yellow-300">
        Aprovado
      </span>
    );
  }

  if (status === "PENDENTE") {
    return (
      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/60">
        Em análise
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => solicitarServoMidia())}
      className="shrink-0 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445] disabled:opacity-60"
    >
      {isPending ? "Enviando..." : "Quero servir"}
    </button>
  );
}
