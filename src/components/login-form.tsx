"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col items-center gap-5">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-center gap-3 rounded-full border-2 border-white bg-white/5 px-5 py-3">
          <span className="shrink-0 text-xl">📧</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Email"
            required
            className="w-full bg-transparent font-brand text-base font-bold tracking-wide text-white placeholder-white/70 outline-none"
          />
        </div>
        {state?.errors?.email && (
          <p className="-mt-2 pl-3 text-xs font-medium text-yellow-200">{state.errors.email[0]}</p>
        )}

        <div className="flex items-center gap-3 rounded-full border-2 border-white bg-white/5 px-5 py-3">
          <span className="shrink-0 text-xl">🔑</span>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            required
            className="w-full bg-transparent font-brand text-base font-bold tracking-wide text-white placeholder-white/70 outline-none"
          />
        </div>
        {state?.errors?.password && (
          <p className="-mt-2 pl-3 text-xs font-medium text-yellow-200">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-center text-xs font-medium text-yellow-200">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Login"}
      </button>
    </form>
  );
}
