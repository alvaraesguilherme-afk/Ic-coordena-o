"use client";

import { useActionState } from "react";
import { solicitarCodigoRecuperacao, confirmarRecuperacao } from "@/app/actions/auth";
import { MailIcon, LockIcon } from "@/components/icons";
import { Field, authInputClass as inputClass } from "@/components/auth-field";

export function EsqueciSenhaForm() {
  const [pedirState, pedirAction, pedirPending] = useActionState(solicitarCodigoRecuperacao, undefined);
  const [confirmarState, confirmarAction, confirmarPending] = useActionState(confirmarRecuperacao, undefined);

  if (confirmarState?.success) {
    return (
      <div className="w-full rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center text-sm font-medium text-emerald-200">
        Senha redefinida! Já pode entrar com a senha nova.
      </div>
    );
  }

  const etapaCodigo = confirmarState?.etapa === "codigo" || pedirState?.etapa === "codigo";
  const identificador = confirmarState?.identificador ?? pedirState?.identificador ?? "";
  const mensagem = confirmarState?.message ?? pedirState?.message;

  if (etapaCodigo) {
    return (
      <form action={confirmarAction} className="flex w-full flex-col gap-4">
        <input type="hidden" name="identificador" value={identificador} />

        <p className="text-center text-xs font-medium text-white/60">
          Digite o código de 6 dígitos que enviamos pro e-mail cadastrado e crie uma senha nova.
        </p>

        <Field icon={<LockIcon className="h-5 w-5" />} error={confirmarState?.errors?.codigo?.[0]}>
          <input
            id="codigo"
            name="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            required
            className={inputClass}
          />
        </Field>

        <Field icon={<LockIcon className="h-5 w-5" />} error={confirmarState?.errors?.password?.[0]}>
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

        <Field icon={<LockIcon className="h-5 w-5" />} error={confirmarState?.errors?.confirmPassword?.[0]}>
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

        {mensagem && <p className="text-center text-xs font-medium text-yellow-200">{mensagem}</p>}

        <button
          type="submit"
          disabled={confirmarPending}
          className="mt-2 w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
        >
          {confirmarPending ? "Confirmando..." : "Redefinir senha"}
        </button>
      </form>
    );
  }

  return (
    <form action={pedirAction} className="flex w-full flex-col gap-4">
      <p className="text-center text-xs font-medium text-white/60">
        Informe seu e-mail ou telefone cadastrado. Vamos mandar um código de verificação pro seu e-mail.
      </p>

      <Field icon={<MailIcon className="h-5 w-5" />} error={pedirState?.errors?.identificador?.[0]}>
        <input
          id="identificador"
          name="identificador"
          type="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="E-mail ou telefone"
          required
          className={inputClass}
        />
      </Field>

      {mensagem && <p className="text-center text-xs font-medium text-yellow-200">{mensagem}</p>}

      <button
        type="submit"
        disabled={pedirPending}
        className="mt-2 w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
      >
        {pedirPending ? "Enviando..." : "Enviar código"}
      </button>
    </form>
  );
}
