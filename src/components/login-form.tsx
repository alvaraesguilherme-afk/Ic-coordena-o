"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { MailIcon, LockIcon, PersonIcon } from "@/components/icons";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col items-center gap-7">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-300/80 shadow-[0_0_25px_-5px_rgba(34,211,238,0.9)]">
        <PersonIcon className="h-9 w-9 text-cyan-100" />
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-white/25 pb-2 focus-within:border-cyan-300">
          <MailIcon className="h-5 w-5 shrink-0 text-white/60" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            required
            className="w-full bg-transparent text-base text-white placeholder-white/50 outline-none"
          />
        </div>
        {state?.errors?.email && <p className="text-xs text-red-300">{state.errors.email[0]}</p>}

        <div className="flex items-center gap-3 border-b border-white/25 pb-2 focus-within:border-cyan-300">
          <LockIcon className="h-5 w-5 shrink-0 text-white/60" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Senha"
            required
            className="w-full bg-transparent text-base text-white placeholder-white/50 outline-none"
          />
        </div>
        {state?.errors?.password && (
          <p className="text-xs text-red-300">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-xs text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-white/20 bg-white/10 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_30px_-8px_rgba(34,211,238,0.7)] transition hover:bg-white/20 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Login"}
      </button>
    </form>
  );
}
