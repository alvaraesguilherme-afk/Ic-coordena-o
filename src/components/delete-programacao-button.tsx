"use client";

import { useTransition } from "react";
import { deleteProgramacao } from "@/app/actions/programacao";

export function DeleteProgramacaoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (confirm("Remover esta publicação da programação?")) {
          startTransition(() => deleteProgramacao(id));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
