"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMembro } from "@/app/actions/membros";

export function MembroForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createMembro, undefined);

  useEffect(() => {
    if (state?.message === "success") {
      router.push("/membros");
    }
  }, [state, router]);

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="birthDate" className="text-sm font-medium">
          Data de nascimento
        </label>
        <input
          id="birthDate"
          name="birthDate"
          type="date"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.birthDate && (
          <p className="text-sm text-red-600">{state.errors.birthDate[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.phone && <p className="text-sm text-red-600">{state.errors.phone[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="address" className="text-sm font-medium">
          Endereço
        </label>
        <input
          id="address"
          name="address"
          placeholder="Rua, número, bairro, cidade - UF"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.address && (
          <p className="text-sm text-red-600">{state.errors.address[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        />
        {state?.errors?.password && (
          <div className="text-sm text-red-600">
            {state.errors.password.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="role" className="text-sm font-medium">
          Papel
        </label>
        <select
          id="role"
          name="role"
          defaultValue="MEMBRO"
          className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black"
        >
          <option value="MEMBRO">Membro</option>
          <option value="LIDER">Líder</option>
        </select>
        {state?.errors?.role && <p className="text-sm text-red-600">{state.errors.role[0]}</p>}
      </div>

      {state?.message && state.message !== "success" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {pending ? "Salvando..." : "Cadastrar membro"}
      </button>
    </form>
  );
}
