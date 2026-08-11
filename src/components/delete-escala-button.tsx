"use client";

import { useTransition } from "react";
import { deleteEscala } from "@/app/actions/escalas";

export function DeleteEscalaButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Remover esta escala?")) {
          startTransition(() => deleteEscala(id));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
