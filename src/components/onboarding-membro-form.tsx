"use client";

import { useActionState, useState } from "react";
import { completarOnboardingMembro } from "@/app/actions/onboarding";
import { Field, authInputClass as inputClass } from "@/components/auth-field";
import { ChurchIcon } from "@/components/icons";

type Igreja = { id: string; nome: string; redeId: string; lider: { name: string } | null };
type Rede = { id: string; nome: string };

export function OnboardingMembroForm({ redes, igrejas }: { redes: Rede[]; igrejas: Igreja[] }) {
  const [state, action, pending] = useActionState(completarOnboardingMembro, undefined);
  const [redeId, setRedeId] = useState("");
  const [igrejaId, setIgrejaId] = useState("");

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <Field icon={<ChurchIcon className="h-5 w-5" />} error={state?.errors?.redeId?.[0]}>
        <select
          id="redeId"
          name="redeId"
          value={redeId}
          onChange={(event) => {
            setRedeId(event.target.value);
            setIgrejaId("");
          }}
          required
          className={`${inputClass} [&>option]:text-black`}
        >
          <option value="" disabled>
            Selecione a rede
          </option>
          {redes.map((rede) => (
            <option key={rede.id} value={rede.id}>
              {rede.nome}
            </option>
          ))}
        </select>
      </Field>

      <Field icon={<ChurchIcon className="h-5 w-5" />} error={state?.errors?.igrejaId?.[0]}>
        <select
          id="igrejaId"
          name="igrejaId"
          value={igrejaId}
          onChange={(event) => setIgrejaId(event.target.value)}
          disabled={!redeId}
          required
          className={`${inputClass} [&>option]:text-black disabled:opacity-50`}
        >
          <option value="" disabled>
            {redeId ? "Selecione a IC" : "Selecione a rede primeiro"}
          </option>
          {igrejas
            .filter((igreja) => igreja.redeId === redeId)
            .map((igreja) => (
              <option key={igreja.id} value={igreja.id}>
                {igreja.nome}
                {igreja.lider ? ` — ${igreja.lider.name}` : ""}
              </option>
            ))}
        </select>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Continuar"}
      </button>
    </form>
  );
}
