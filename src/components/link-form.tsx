"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLink } from "@/app/actions/links";
import type { CategoriaLink } from "@/lib/links";

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function LinkForm({ categoria }: { categoria: CategoriaLink }) {
  const [state, action, pending] = useActionState(createLink, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex w-full flex-col gap-3">
      <input type="hidden" name="categoria" value={categoria} />

      <input name="titulo" placeholder="Título do link" required className={inputClass} />
      {state?.errors?.titulo && <p className="text-sm text-red-300">{state.errors.titulo[0]}</p>}

      <input name="url" type="url" placeholder="https://..." required className={inputClass} />
      {state?.errors?.url && <p className="text-sm text-red-300">{state.errors.url[0]}</p>}

      {state?.message && state.message !== "success" && (
        <p className="text-sm text-red-300">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {pending ? "Adicionando..." : "Adicionar"}
      </button>
    </form>
  );
}
