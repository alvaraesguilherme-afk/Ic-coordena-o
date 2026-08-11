"use client";

import { useTransition } from "react";
import { deleteIgreja } from "@/app/actions/igrejas";

export function DeleteIgrejaButton({
  id,
  nome,
  redeId,
}: {
  id: string;
  nome: string;
  redeId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Remover a IC "${nome}"?`)) {
          startTransition(() => deleteIgreja(id, redeId));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
