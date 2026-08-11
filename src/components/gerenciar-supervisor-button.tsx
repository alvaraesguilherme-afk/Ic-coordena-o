"use client";

import { useTransition } from "react";
import { promoverSupervisorMidia, removerSupervisorMidia } from "@/app/actions/servo";

export function GerenciarSupervisorButton({
  userId,
  supervisor,
}: {
  userId: string;
  supervisor: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (supervisor) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => removerSupervisorMidia(userId))}
        className="shrink-0 rounded-full bg-yellow-400/20 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:bg-yellow-400/30 disabled:opacity-60"
      >
        Supervisor · remover
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => promoverSupervisorMidia(userId))}
      className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 disabled:opacity-60"
    >
      Tornar supervisor
    </button>
  );
}
