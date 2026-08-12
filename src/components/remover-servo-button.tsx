"use client";

import { useTransition } from "react";
import { removerServoMidia } from "@/app/actions/servo";

export function RemoverServoButton({ userId, nome }: { userId: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Remover ${nome} definitivamente da equipe de mídia?`)) {
          startTransition(() => removerServoMidia(userId));
        }
      }}
      className="rounded-full border border-red-400/40 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-400/10 disabled:opacity-60"
    >
      {isPending ? "Removendo..." : "Remover"}
    </button>
  );
}
