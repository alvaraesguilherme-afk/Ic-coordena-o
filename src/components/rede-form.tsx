"use client";

import { useActionState } from "react";
import { createRede } from "@/app/actions/redes";

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function RedeForm() {
  const [state, action, pending] = useActionState(createRede, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-white/80">
          Nome da rede
        </label>
        <input id="nome" name="nome" required className={inputClass} />
        {state?.errors?.nome && <p className="text-sm text-red-300">{state.errors.nome[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="liderNome" className="text-sm font-medium text-white/80">
          Líder responsável (opcional)
        </label>
        <input id="liderNome" name="liderNome" className={inputClass} />
      </div>

      {state?.message && <p className="text-sm text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar rede"}
      </button>
    </form>
  );
}
