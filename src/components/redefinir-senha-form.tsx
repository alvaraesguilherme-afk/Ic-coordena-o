"use client";

import { useActionState } from "react";
import { redefinirSenhaMembro } from "@/app/actions/membros";
import { LockIcon } from "@/components/icons";
import { Field, authInputClass as inputClass } from "@/components/auth-field";

export function RedefinirSenhaForm({ membroId, membroNome }: { membroId: string; membroNome: string }) {
  const action = redefinirSenhaMembro.bind(null, membroId);
  const [state, formAction, pending] = useActionState(action, undefined);

  if (state?.success) {
    return (
      <div className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center text-sm font-medium text-emerald-200">
        Senha de {membroNome} redefinida. Agora é só repassar a senha nova pra pessoa.
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <p className="text-center text-xs font-medium text-white/60">
        {membroNome} esqueceu a senha? Defina uma senha nova aqui e repasse pra pessoa.
      </p>

      <Field icon={<LockIcon className="h-5 w-5" />} error={state?.errors?.password?.[0]}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Nova senha"
          required
          className={inputClass}
        />
      </Field>

      <Field icon={<LockIcon className="h-5 w-5" />} error={state?.errors?.confirmPassword?.[0]}>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Confirmar senha nova"
          required
          className={inputClass}
        />
      </Field>

      {state?.message && (
        <p className="text-center text-xs font-medium text-yellow-200">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3 font-brand text-sm font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_4px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_1px_0_0_#b8790a] disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
