"use client";

import { useTransition } from "react";
import { deleteAviso } from "@/app/actions/avisos";

export function DeleteAvisoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Remover este aviso?")) {
          startTransition(() => deleteAviso(id));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
