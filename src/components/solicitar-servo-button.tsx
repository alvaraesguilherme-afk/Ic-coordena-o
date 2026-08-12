"use client";

import { useState, useTransition } from "react";
import { solicitarServoMidia } from "@/app/actions/servo";
import { AREAS_MIDIA, AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";

export function SolicitarServoButton({
  status,
  areas,
}: {
  status: "NENHUM" | "PENDENTE" | "APROVADO";
  areas: AreaMidia[];
}) {
  const [isPending, startTransition] = useTransition();
  const [escolhendo, setEscolhendo] = useState(false);
  const [areaEscolhida, setAreaEscolhida] = useState<AreaMidia | "">("");

  const areasLabel = areas.length > 0 ? ` · ${areas.map((a) => AREA_MIDIA_LABEL[a]).join(", ")}` : "";

  if (status === "APROVADO") {
    return (
      <span className="rounded-full bg-yellow-400/20 px-3 py-1.5 text-xs font-bold text-yellow-300">
        Aprovado{areasLabel}
      </span>
    );
  }

  if (status === "PENDENTE") {
    return (
      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/60">
        Em análise{areasLabel}
      </span>
    );
  }

  if (escolhendo) {
    return (
      <div className="flex shrink-0 flex-col gap-2">
        <select
          value={areaEscolhida}
          onChange={(event) => setAreaEscolhida(event.target.value as AreaMidia)}
          className="rounded-md border border-white/15 bg-white/95 px-3 py-1.5 text-xs text-black outline-none [&>option]:text-black"
        >
          <option value="" disabled>
            Escolha a área...
          </option>
          {AREAS_MIDIA.map((areaOpcao) => (
            <option key={areaOpcao} value={areaOpcao}>
              {AREA_MIDIA_LABEL[areaOpcao]}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending || !areaEscolhida}
            onClick={() =>
              startTransition(async () => {
                await solicitarServoMidia(areaEscolhida as AreaMidia);
                setEscolhendo(false);
              })
            }
            className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445] disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => setEscolhendo(false)}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEscolhendo(true)}
      className="shrink-0 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445]"
    >
      Quero servir
    </button>
  );
}
