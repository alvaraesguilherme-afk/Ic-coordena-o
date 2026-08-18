"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { transferirMembro } from "@/app/actions/igrejas";

type Membro = { id: string; name: string; avatarUrl: string | null };
type Igreja = { id: string; nome: string };

export function TransferirMembroRow({
  membro,
  outrasIcs,
}: {
  membro: Membro;
  outrasIcs: Igreja[];
}) {
  const [destino, setDestino] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feito, setFeito] = useState(false);

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
        {membro.avatarUrl && (
          <Image src={membro.avatarUrl} alt={membro.name} width={32} height={32} className="h-full w-full object-cover" />
        )}
      </div>
      <p className="min-w-0 flex-1 truncate text-sm text-white">{membro.name}</p>

      {feito ? (
        <span className="text-xs text-emerald-300">Transferido</span>
      ) : (
        <>
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            disabled={isPending}
            className="rounded-md border border-white/15 bg-white/95 px-2 py-1 text-xs text-black outline-none disabled:opacity-60 [&>option]:text-black"
          >
            <option value="">Mover pra...</option>
            {outrasIcs.map((ic) => (
              <option key={ic.id} value={ic.id}>
                {ic.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!destino || isPending}
            onClick={() => {
              startTransition(async () => {
                await transferirMembro(membro.id, destino);
                setFeito(true);
              });
            }}
            className="shrink-0 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-100 transition-colors hover:bg-yellow-400/20 disabled:opacity-40"
          >
            {isPending ? "..." : "Transferir"}
          </button>
        </>
      )}
    </li>
  );
}
