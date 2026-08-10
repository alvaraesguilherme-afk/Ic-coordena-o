"use client";

import { useTransition } from "react";
import { deleteMembro } from "@/app/actions/membros";

export function DeleteMembroButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Remover ${name} da IC?`)) {
          startTransition(() => deleteMembro(id));
        }
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
