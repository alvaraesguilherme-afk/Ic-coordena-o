"use client";

import { useState, useTransition } from "react";
import { solicitarServoMidia } from "@/app/actions/servo";
import { FUNCOES_MIDIA, FUNCAO_MIDIA_LABEL, type FuncaoMidia } from "@/lib/funcoes-midia";

const DIAS_ESPERA_APOS_RECUSA = 30;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

function diasParaLiberarNovoPedido(recusadoEm: Date) {
  const liberaEm = recusadoEm.getTime() + DIAS_ESPERA_APOS_RECUSA * MS_POR_DIA;
  return Math.max(0, Math.ceil((liberaEm - Date.now()) / MS_POR_DIA));
}

export function SolicitarServoButton({
  status,
  areas,
  recusadoEm,
}: {
  status: "NENHUM" | "PENDENTE" | "APROVADO";
  areas: FuncaoMidia[];
  recusadoEm: Date | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [escolhendo, setEscolhendo] = useState(false);
  const [areaEscolhida, setAreaEscolhida] = useState<FuncaoMidia | "">("");
  const [erro, setErro] = useState<string | null>(null);

  const areasLabel = areas.length > 0 ? ` · ${areas.map((a) => FUNCAO_MIDIA_LABEL[a]).join(", ")}` : "";

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

  const diasRestantes = recusadoEm ? diasParaLiberarNovoPedido(recusadoEm) : 0;
  if (diasRestantes > 0) {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300">
          Negado
        </span>
        <span className="text-right text-[11px] text-white/40">
          Pode pedir de novo em {diasRestantes} dia{diasRestantes === 1 ? "" : "s"}
        </span>
      </div>
    );
  }

  if (escolhendo) {
    return (
      <div className="flex shrink-0 flex-col gap-2">
        <select
          value={areaEscolhida}
          onChange={(event) => setAreaEscolhida(event.target.value as FuncaoMidia)}
          className="rounded-md border border-white/15 bg-white/95 px-3 py-1.5 text-xs text-black outline-none [&>option]:text-black"
        >
          <option value="" disabled>
            Escolha a função...
          </option>
          {FUNCOES_MIDIA.map((areaOpcao) => (
            <option key={areaOpcao} value={areaOpcao}>
              {FUNCAO_MIDIA_LABEL[areaOpcao]}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending || !areaEscolhida}
            onClick={() =>
              startTransition(async () => {
                const result = await solicitarServoMidia(areaEscolhida as FuncaoMidia);
                if (result?.message) {
                  setErro(result.message);
                  return;
                }
                setErro(null);
                setEscolhendo(false);
              })
            }
            className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445] disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Confirmar"}
          </button>
          <button
            type="button"
            onClick={() => {
              setErro(null);
              setEscolhendo(false);
            }}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
        {erro && <p className="max-w-[12rem] text-right text-xs text-red-300">{erro}</p>}
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
