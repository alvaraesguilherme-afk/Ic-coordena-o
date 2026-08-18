"use client";

import { useActionState, useState } from "react";
import { esqueciSenha } from "@/app/actions/auth";
import { MailIcon, PhoneIcon, CalendarIcon, LockIcon } from "@/components/icons";
import { Field, authInputClass as inputClass } from "@/components/auth-field";
import { formatPhone } from "@/lib/phone";

export function EsqueciSenhaForm() {
  const [state, action, pending] = useActionState(esqueciSenha, undefined);
  const [phone, setPhone] = useState("");

  if (state?.success) {
    return (
      <div className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center text-sm font-medium text-emerald-200">
        Senha redefinida! Já pode entrar com a senha nova.
      </div>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-4">
      <p className="text-center text-xs font-medium text-white/60">
        Confirme seus dados cadastrados pra criar uma senha nova.
      </p>

      <Field icon={<MailIcon className="h-5 w-5" />} error={state?.errors?.email?.[0]}>
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
          className={inputClass}
        />
      </Field>

      <Field icon={<PhoneIcon className="h-5 w-5" />} error={state?.errors?.phone?.[0]}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          required
          value={phone}
          onChange={(event) => setPhone(formatPhone(event.target.value))}
          className={inputClass}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="birthDate" className="pl-3 font-brand text-xs font-bold uppercase tracking-wide text-white/60">
          Data de nascimento
        </label>
        <Field icon={<CalendarIcon className="h-5 w-5" />} error={state?.errors?.birthDate?.[0]}>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            aria-label="Data de nascimento"
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>
      </div>

      <Field icon={<LockIcon className="h-5 w-5" />} error={state?.errors?.password?.[0]}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Senha nova"
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
        className="mt-2 w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
      >
        {pending ? "Confirmando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
