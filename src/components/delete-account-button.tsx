"use client";

import { useState, useTransition } from "react";
import { apagarMinhaConta } from "@/app/actions/auth";

export function DeleteAccountButton() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setStep(1)}
        className="flex w-full items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-60"
      >
        Apagar minha conta
      </button>

      {step > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setStep(0)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-red-400/40 bg-[#131a44] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 1 ? (
              <>
                <h2 className="text-lg font-semibold text-white">Apagar sua conta?</h2>
                <p className="mt-2 text-sm text-white/60">
                  Seus dados pessoais, foto, escalas, presenças, avisos, links e playlists que
                  você postou serão apagados. Essa ação não pode ser desfeita.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex-1 rounded-full border border-white/20 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-full bg-red-500/90 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-500"
                  >
                    Sim, continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-brand text-lg font-extrabold uppercase tracking-wide text-red-300">
                  Você tem certeza mesmo?
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Essa é a última confirmação. Sua conta e todos os seus dados pessoais serão
                  apagados <span className="font-semibold text-white">permanentemente</span>, e
                  você será desconectado.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex-1 rounded-full border border-white/20 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      startTransition(() => apagarMinhaConta());
                    }}
                    className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-red-500 disabled:opacity-60"
                  >
                    {isPending ? "Apagando..." : "Apagar definitivamente"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
