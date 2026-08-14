"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";
import { LogoutIcon } from "@/components/icons";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Tem certeza que quer sair da sua conta?")) {
          startTransition(() => logout());
        }
      }}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 text-left shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:border-red-400/40 disabled:opacity-60"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
        <LogoutIcon className="h-5 w-5 text-yellow-100" />
      </div>
      <div>
        <p className="font-medium text-white">{isPending ? "Saindo..." : "Sair"}</p>
        <p className="text-sm text-white/50">Encerrar sua sessão neste dispositivo</p>
      </div>
    </button>
  );
}
