"use client";

import { useState } from "react";
import { RefreshIcon } from "@/components/icons";

export function RecarregarButton() {
  const [recarregando, setRecarregando] = useState(false);

  return (
    <button
      type="button"
      disabled={recarregando}
      onClick={() => {
        setRecarregando(true);
        window.location.reload();
      }}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 text-left backdrop-blur-xl transition-colors hover:border-yellow-400/40 disabled:opacity-60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
        <RefreshIcon className={`h-5 w-5 text-yellow-100 ${recarregando ? "animate-spin" : ""}`} />
      </div>
      <div>
        <p className="font-medium text-white">
          {recarregando ? "Recarregando..." : "Recarregar dados"}
        </p>
        <p className="text-sm text-white/50">Atualiza o app sem precisar fechar</p>
      </div>
    </button>
  );
}
