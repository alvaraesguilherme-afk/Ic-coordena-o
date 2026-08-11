"use client";

import { useActionState } from "react";
import { createIgreja } from "@/app/actions/igrejas";
import { DIAS_SEMANA, DIA_SEMANA_LABEL } from "@/lib/igrejas";

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function IgrejaForm({ redeId }: { redeId: string }) {
  const [state, action, pending] = useActionState(createIgreja, undefined);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="redeId" value={redeId} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-white/80">
          Nome da IC
        </label>
        <input id="nome" name="nome" required className={inputClass} />
        {state?.errors?.nome && <p className="text-sm text-red-300">{state.errors.nome[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="liderNome" className="text-sm font-medium text-white/80">
          Líder responsável
        </label>
        <input id="liderNome" name="liderNome" required className={inputClass} />
        {state?.errors?.liderNome && (
          <p className="text-sm text-red-300">{state.errors.liderNome[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="diaSemana" className="text-sm font-medium text-white/80">
            Dia da semana
          </label>
          <select
            id="diaSemana"
            name="diaSemana"
            required
            defaultValue=""
            className={`${inputClass} [&>option]:text-black`}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {DIAS_SEMANA.map((dia) => (
              <option key={dia} value={dia}>
                {DIA_SEMANA_LABEL[dia]}
              </option>
            ))}
          </select>
          {state?.errors?.diaSemana && (
            <p className="text-sm text-red-300">{state.errors.diaSemana[0]}</p>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="horario" className="text-sm font-medium text-white/80">
            Horário
          </label>
          <input
            id="horario"
            name="horario"
            type="time"
            required
            className={`${inputClass} [color-scheme:light]`}
          />
          {state?.errors?.horario && (
            <p className="text-sm text-red-300">{state.errors.horario[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="endereco" className="text-sm font-medium text-white/80">
          Endereço (opcional)
        </label>
        <input id="endereco" name="endereco" className={inputClass} />
      </div>

      {state?.message && <p className="text-sm text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar IC"}
      </button>
    </form>
  );
}
