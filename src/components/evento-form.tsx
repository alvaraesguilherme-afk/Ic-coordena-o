"use client";

import { useActionState } from "react";
import { createEvento } from "@/app/actions/eventos";

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function EventoForm({ redeId }: { redeId: string }) {
  const createEventoComRede = createEvento.bind(null, redeId);
  const [state, action, pending] = useActionState(createEventoComRede, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="titulo" className="text-sm font-medium text-white/80">
          Nome do evento
        </label>
        <input
          id="titulo"
          name="titulo"
          placeholder="Celulão de julho, Confraternização..."
          required
          className={inputClass}
        />
        {state?.errors?.titulo && <p className="text-sm text-red-300">{state.errors.titulo[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="data" className="text-sm font-medium text-white/80">
          Data
        </label>
        <input id="data" name="data" type="date" required className={`${inputClass} [color-scheme:light]`} />
        {state?.errors?.data && <p className="text-sm text-red-300">{state.errors.data[0]}</p>}
      </div>

      {state?.message && <p className="text-sm text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar evento"}
      </button>
    </form>
  );
}
