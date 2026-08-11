"use client";

import { useTransition } from "react";
import { deleteMembro } from "@/app/actions/membros";

export function DeleteMembroButton({
  id,
  nome,
  redeId,
  igrejaId,
}: {
  id: string;
  nome: string;
  redeId: string;
  igrejaId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Remover ${nome} desta IC?`)) {
          startTransition(() => deleteMembro(id, redeId, igrejaId));
        }
      }}
      className="ml-auto text-xs text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
