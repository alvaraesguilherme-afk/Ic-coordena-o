"use client";

import { useState, useTransition } from "react";
import { setNotificacoes } from "@/app/actions/perfil";

export function NotificacoesToggle({ ativo }: { ativo: boolean }) {
  const [checked, setChecked] = useState(ativo);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={isPending}
      onClick={() => {
        const next = !checked;
        setChecked(next);
        startTransition(() => setNotificacoes(next));
      }}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-yellow-400" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
