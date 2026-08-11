"use client";

import { useActionState, useState } from "react";
import { createEscala } from "@/app/actions/escalas";
import { TIPOS_ESCALA, ESCALA_TIPO_LABEL, type TipoEscala } from "@/lib/escalas";

type Membro = { id: string; name: string };

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function EscalaForm({
  membros,
  servos,
  defaultTipo,
}: {
  membros: Membro[];
  servos: Membro[];
  defaultTipo?: TipoEscala;
}) {
  const [state, action, pending] = useActionState(createEscala, undefined);
  const [tipo, setTipo] = useState<TipoEscala | "">(defaultTipo ?? "");

  const opcoesParticipantes = tipo === "MIDIA" ? servos : membros;

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tipo" className="text-sm font-medium text-white/80">
          Tipo de escala
        </label>
        <select
          id="tipo"
          name="tipo"
          required
          value={tipo}
          onChange={(event) => setTipo(event.target.value as TipoEscala)}
          className={`${inputClass} [&>option]:text-black`}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {TIPOS_ESCALA.map((tipoOpcao) => (
            <option key={tipoOpcao} value={tipoOpcao}>
              {ESCALA_TIPO_LABEL[tipoOpcao]}
            </option>
          ))}
        </select>
        {state?.errors?.tipo && <p className="text-sm text-red-300">{state.errors.tipo[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="data" className="text-sm font-medium text-white/80">
          Data e hora
        </label>
        <input
          id="data"
          name="data"
          type="datetime-local"
          required
          className={`${inputClass} [color-scheme:light]`}
        />
        {state?.errors?.data && <p className="text-sm text-red-300">{state.errors.data[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacao" className="text-sm font-medium text-white/80">
          Observação (opcional)
        </label>
        <textarea id="observacao" name="observacao" rows={2} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white/80">
          {tipo === "MIDIA" ? "Servos de mídia" : "Participantes"}
        </span>
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-md border border-white/15 bg-white/[.06] p-3 backdrop-blur-xl">
          {opcoesParticipantes.length === 0 && (
            <p className="text-sm text-white/50">
              {tipo === "MIDIA"
                ? "Nenhum servo de mídia aprovado ainda."
                : "Nenhuma pessoa disponível."}
            </p>
          )}
          {opcoesParticipantes.map((pessoa) => (
            <label key={pessoa.id} className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" name="participantes" value={pessoa.id} />
              {pessoa.name}
            </label>
          ))}
        </div>
        {state?.errors?.participantes && (
          <p className="text-sm text-red-300">{state.errors.participantes[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar escala"}
      </button>
    </form>
  );
}
