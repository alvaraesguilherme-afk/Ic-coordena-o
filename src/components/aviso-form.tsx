"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAviso } from "@/app/actions/avisos";

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function AvisoForm() {
  const [state, action, pending] = useActionState(createAviso, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex w-full flex-col gap-3">
      <input name="titulo" placeholder="Título do aviso" required className={inputClass} />
      {state?.errors?.titulo && <p className="text-sm text-red-300">{state.errors.titulo[0]}</p>}

      <textarea
        name="conteudo"
        placeholder="Escreva o aviso..."
        rows={3}
        required
        className={inputClass}
      />
      {state?.errors?.conteudo && (
        <p className="text-sm text-red-300">{state.errors.conteudo[0]}</p>
      )}

      {state?.message && state.message !== "success" && (
        <p className="text-sm text-red-300">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-gradient-to-r from-sky-500 to-orange-400 px-5 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Publicando..." : "Publicar aviso"}
      </button>
    </form>
  );
}
