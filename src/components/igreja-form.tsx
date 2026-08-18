"use client";

import { useActionState } from "react";
import { createIgreja, updateIgreja } from "@/app/actions/igrejas";
import { DIAS_SEMANA, DIA_SEMANA_LABEL, type DiaSemana } from "@/lib/igrejas";

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

type Lider = { id: string; name: string };

export function IgrejaForm({
  redeId,
  lideresDisponiveis,
  igreja,
}: {
  redeId: string;
  lideresDisponiveis: Lider[];
  igreja?: {
    id: string;
    nome: string;
    liderId: string | null;
    diaSemana: DiaSemana;
    horario: string;
    endereco: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    igreja ? updateIgreja.bind(null, igreja.id) : createIgreja,
    undefined
  );

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="redeId" value={redeId} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nome" className="text-sm font-medium text-white/80">
          Nome da IC
        </label>
        <input id="nome" name="nome" required defaultValue={igreja?.nome} className={inputClass} />
        {state?.errors?.nome && <p className="text-sm text-red-300">{state.errors.nome[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="liderId" className="text-sm font-medium text-white/80">
          Líder responsável
        </label>
        <select
          id="liderId"
          name="liderId"
          required
          defaultValue={igreja?.liderId ?? ""}
          className={`${inputClass} [&>option]:text-black`}
        >
          <option value="" disabled>
            {lideresDisponiveis.length === 0 ? "Nenhum líder disponível" : "Selecione..."}
          </option>
          {lideresDisponiveis.map((lider) => (
            <option key={lider.id} value={lider.id}>
              {lider.name}
            </option>
          ))}
        </select>
        {state?.errors?.liderId && (
          <p className="text-sm text-red-300">{state.errors.liderId[0]}</p>
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
            defaultValue={igreja?.diaSemana ?? ""}
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
            defaultValue={igreja?.horario}
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
        <input id="endereco" name="endereco" defaultValue={igreja?.endereco ?? ""} className={inputClass} />
      </div>

      {state?.message && <p className="text-sm text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {pending ? "Salvando..." : igreja ? "Salvar alterações" : "Criar IC"}
      </button>
    </form>
  );
}
