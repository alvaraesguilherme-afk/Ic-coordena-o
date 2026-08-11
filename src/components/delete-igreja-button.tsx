"use client";

import { useState, useTransition } from "react";
import { deleteIgreja } from "@/app/actions/igrejas";

export function DeleteIgrejaButton({
  id,
  nome,
  redeId,
}: {
  id: string;
  nome: string;
  redeId: string;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setStep(1);
        }}
        className="text-sm text-red-300 hover:underline disabled:opacity-60"
      >
        Remover
      </button>

      {step > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setStep(0);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-red-400/40 bg-[#131a44] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 1 ? (
              <>
                <h2 className="text-lg font-semibold text-white">Remover a IC &ldquo;{nome}&rdquo;?</h2>
                <p className="mt-2 text-sm text-white/60">
                  Essa IC e o vínculo dos membros dela serão apagados. Essa ação não pode ser
                  desfeita.
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
                  Essa é a última confirmação. A IC &ldquo;{nome}&rdquo; e tudo ligado a ela serão
                  apagados <span className="font-semibold text-white">permanentemente</span>.
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
                      startTransition(() => deleteIgreja(id, redeId));
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
