"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelarEncontro } from "@/app/actions/frequencia";

export function CancelarEncontroButton({
  igrejaId,
  dataStr,
  cancelada,
}: {
  igrejaId: string;
  dataStr: string;
  cancelada: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmar(novoValor: boolean) {
    setErro(null);
    startTransition(async () => {
      const result = await cancelarEncontro(igrejaId, dataStr, novoValor);
      if (result?.message) {
        setErro(result.message);
        return;
      }
      setAberto(false);
      router.refresh();
    });
  }

  if (cancelada) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => confirmar(false)}
        className="-mt-2 self-center text-xs font-medium text-white/50 hover:underline disabled:opacity-60"
      >
        {isPending ? "Desfazendo..." : "Desfazer — vai ter IC essa semana"}
      </button>
    );
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="-mt-2 self-center text-xs font-medium text-white/50 hover:underline"
      >
        Não houve IC
      </button>
    );
  }

  return (
    <div className="-mt-2 flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/[.05] p-3">
      <p className="text-center text-xs text-white/60">
        Confirma que não houve encontro dessa semana? Ninguém fica marcado como falta.
      </p>
      {erro && <p className="text-xs text-red-300">{erro}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70"
        >
          Voltar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => confirmar(true)}
          className="rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {isPending ? "Confirmando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
