"use client";

import { useState, useTransition } from "react";
import { marcarPresenca } from "@/app/actions/frequencia";
import { CheckIcon, XIcon } from "@/components/icons";

export function PresencaMarcacao({
  igrejaId,
  dataStr,
  membroId,
  presenteInicial,
  motivoInicial,
}: {
  igrejaId: string;
  dataStr: string;
  membroId: string;
  presenteInicial: boolean | null;
  motivoInicial: string | null;
}) {
  const [presente, setPresente] = useState(presenteInicial);
  const [motivo, setMotivo] = useState(motivoInicial ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function salvar(novoPresente: boolean, novoMotivo: string) {
    const presenteAnterior = presente;
    const motivoAnterior = motivo;
    setPresente(novoPresente);
    setErro(null);
    startTransition(async () => {
      const result = await marcarPresenca(igrejaId, dataStr, membroId, novoPresente, novoMotivo);
      if (result?.message) {
        setPresente(presenteAnterior);
        setMotivo(motivoAnterior);
        setErro(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Presente"
          aria-pressed={presente === true}
          disabled={isPending}
          onClick={() => salvar(true, motivo)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
            presente === true
              ? "bg-green-500 text-white"
              : "border border-white/15 text-white/30 hover:border-green-400/40 hover:text-green-300"
          }`}
        >
          <CheckIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Falta"
          aria-pressed={presente === false}
          disabled={isPending}
          onClick={() => salvar(false, motivo)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
            presente === false
              ? "bg-red-500 text-white"
              : "border border-white/15 text-white/30 hover:border-red-400/40 hover:text-red-300"
          }`}
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {presente === false && (
        <input
          type="text"
          placeholder="Motivo (opcional)"
          value={motivo}
          disabled={isPending}
          onChange={(event) => setMotivo(event.target.value)}
          onBlur={() => salvar(false, motivo)}
          className="w-40 rounded-lg border border-white/15 bg-white/[.04] px-2 py-1 text-xs text-white placeholder:text-white/30 focus:border-yellow-400/40 focus:outline-none disabled:opacity-60"
        />
      )}
      {erro && <p className="max-w-[10rem] text-right text-xs text-red-300">{erro}</p>}
    </div>
  );
}
