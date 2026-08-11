"use client";

import { useTransition } from "react";
import { deleteRede } from "@/app/actions/redes";

export function DeleteRedeButton({ id, nome }: { id: string; nome: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Remover a rede "${nome}" e todas as suas ICs?`)) {
          startTransition(() => deleteRede(id));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
