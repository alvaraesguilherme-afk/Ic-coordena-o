"use client";

import { useTransition } from "react";
import { deleteEvento } from "@/app/actions/eventos";

export function DeleteEventoButton({ id, redeId }: { id: string; redeId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Remover este evento?")) {
          startTransition(() => deleteEvento(id, redeId));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
