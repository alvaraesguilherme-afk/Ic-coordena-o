"use client";

import { useActionState } from "react";
import { createReuniao } from "@/app/actions/reunioes";

export function ReuniaoForm() {
  const [state, action, pending] = useActionState(createReuniao, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium">
          Título
        </label>
        <input
          id="titulo"
          name="titulo"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.titulo && <p className="text-sm text-red-600">{state.errors.titulo[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="data" className="text-sm font-medium">
          Data e hora
        </label>
        <input
          id="data"
          name="data"
          type="datetime-local"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.data && <p className="text-sm text-red-600">{state.errors.data[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição (opcional)
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {pending ? "Salvando..." : "Criar reunião"}
      </button>
    </form>
  );
}
