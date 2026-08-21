"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { remarcarEncontro } from "@/app/actions/frequencia";
import { dataKey } from "@/lib/sabados";

export function RemarcarEncontroButton({
  redeId,
  igrejaId,
  hoje,
  dataAtualStr,
}: {
  redeId: string;
  igrejaId: string;
  hoje: Date;
  dataAtualStr: string;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [novaData, setNovaData] = useState(dataKey(hoje));
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="-mt-2 self-center text-xs font-medium text-yellow-300 hover:underline"
      >
        Remarcar
      </button>
    );
  }

  return (
    <div className="-mt-2 flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/[.05] p-3">
      <p className="text-center text-xs text-white/60">
        A reunião dessa semana foi remarcada? Escolha o novo dia — todo mundo da IC recebe um aviso.
      </p>
      <input
        type="date"
        value={novaData}
        onChange={(e) => setNovaData(e.target.value)}
        className="rounded-md border border-white/15 bg-white/95 px-3 py-1.5 text-sm text-black outline-none [color-scheme:light]"
      />
      {erro && <p className="text-xs text-red-300">{erro}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setErro(null);
            startTransition(async () => {
              const result = await remarcarEncontro(igrejaId, dataAtualStr, novaData);
              if (result?.message) {
                setErro(result.message);
                return;
              }
              setAberto(false);
              router.push(`/redes/${redeId}/igrejas/${igrejaId}/frequencia?data=${novaData}`);
            });
          }}
          className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445] disabled:opacity-60"
        >
          {isPending ? "Avisando..." : "Confirmar e avisar"}
        </button>
      </div>
    </div>
  );
}
