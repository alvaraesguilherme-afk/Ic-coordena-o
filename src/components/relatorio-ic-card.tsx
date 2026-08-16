"use client";

import { useState, useTransition } from "react";
import { enviarRelatorioIc } from "@/app/actions/relatorio-ic";
import type { TipoEscalaIc } from "@/lib/escalas";

export type RelatorioAtual = { visitantes: number; presentes: number; novosConvertidos: number };

// Caixinha "Relatório" abaixo das duas vagas do dia — só aparece pra quem está
// escalado naquele dia (ou admin). Depois de enviado, trava pra sempre: não
// existe fluxo de edição, só o próprio banco impedindo reenvio (@@unique) e essa
// UI parando de mostrar o formulário.
export function RelatorioIcCard({
  tipo,
  data,
  atual,
  podeAcessar,
}: {
  tipo: TipoEscalaIc;
  data: string;
  atual?: RelatorioAtual;
  podeAcessar: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [visitantes, setVisitantes] = useState("");
  const [presentes, setPresentes] = useState("");
  const [novosConvertidos, setNovosConvertidos] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [enviado, setEnviado] = useState(!!atual);
  const [isPending, startTransition] = useTransition();

  if (!podeAcessar) return null;

  if (enviado) {
    return (
      <div className="mt-3 rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/50">
        <span className="text-green-300">✓ Relatório enviado</span>
        {atual && (
          <span className="text-white/30">
            {" "}
            · {atual.visitantes} visitantes · {atual.presentes} presentes · {atual.novosConvertidos} convertidos
          </span>
        )}
      </div>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:bg-yellow-400/20"
      >
        📋 Relatório
      </button>
    );
  }

  function enviar() {
    const v = Number(visitantes);
    const p = Number(presentes);
    const n = Number(novosConvertidos);
    if (
      visitantes === "" ||
      presentes === "" ||
      novosConvertidos === "" ||
      !Number.isInteger(v) ||
      v < 0 ||
      !Number.isInteger(p) ||
      p < 0 ||
      !Number.isInteger(n) ||
      n < 0
    ) {
      setErro("Preencha os três campos com números válidos.");
      return;
    }
    setErro(undefined);
    startTransition(async () => {
      const res = await enviarRelatorioIc(tipo, data, v, p, n);
      if (res?.message) {
        setErro(res.message);
      } else {
        setEnviado(true);
      }
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-lg border border-white/15 bg-white/[.04] p-3">
      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40">Visitantes</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            disabled={isPending}
            value={visitantes}
            onChange={(e) => setVisitantes(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/95 px-2 py-1 text-xs text-black outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40">Presentes</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            disabled={isPending}
            value={presentes}
            onChange={(e) => setPresentes(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/95 px-2 py-1 text-xs text-black outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-white/40">Convertidos</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            disabled={isPending}
            value={novosConvertidos}
            onChange={(e) => setNovosConvertidos(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-white/95 px-2 py-1 text-xs text-black outline-none"
          />
        </label>
      </div>

      <p className="text-[10px] leading-relaxed text-red-300/80">
        ⚠️ Confira antes de enviar — depois de enviado, esse relatório não pode mais ser alterado.
      </p>

      {erro && <p className="text-xs text-red-300">{erro}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={enviar}
          disabled={isPending}
          className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-[#1a1200] disabled:opacity-50"
        >
          Enviar
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          disabled={isPending}
          className="rounded-lg px-3 py-1.5 text-xs text-white/50 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
