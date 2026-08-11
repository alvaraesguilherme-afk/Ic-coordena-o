"use client";

import { useActionState, useState } from "react";
import { completarOnboardingLider } from "@/app/actions/onboarding";
import { Field, authInputClass as inputClass } from "@/components/auth-field";
import { ChurchIcon } from "@/components/icons";

type Rede = { id: string; nome: string };

export function OnboardingLiderForm({
  redesParaLiderar,
  redes,
}: {
  redesParaLiderar: Rede[];
  redes: Rede[];
}) {
  const [state, action, pending] = useActionState(completarOnboardingLider, undefined);
  const [liderDeRede, setLiderDeRede] = useState<"sim" | "nao" | "">("");
  const [redeParticipaId, setRedeParticipaId] = useState("");

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <input type="hidden" name="liderDeRede" value={liderDeRede} />

      <div className="flex flex-col gap-1.5">
        <p className="pl-3 font-brand text-sm font-bold uppercase tracking-wide text-white/80">
          Você é líder de uma rede?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setLiderDeRede("sim")}
            className={`flex-1 rounded-full border-2 py-2.5 font-brand text-sm font-bold uppercase tracking-wide transition-colors ${
              liderDeRede === "sim"
                ? "border-yellow-300 bg-yellow-300/20 text-yellow-200"
                : "border-white/40 text-white/70"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setLiderDeRede("nao")}
            className={`flex-1 rounded-full border-2 py-2.5 font-brand text-sm font-bold uppercase tracking-wide transition-colors ${
              liderDeRede === "nao"
                ? "border-yellow-300 bg-yellow-300/20 text-yellow-200"
                : "border-white/40 text-white/70"
            }`}
          >
            Não
          </button>
        </div>
        {state?.errors?.liderDeRede && (
          <p className="pl-3 text-xs font-medium text-yellow-200">{state.errors.liderDeRede[0]}</p>
        )}
      </div>

      {liderDeRede === "sim" && (
        <Field icon={<ChurchIcon className="h-5 w-5" />} error={state?.errors?.redeId?.[0]}>
          <select
            id="redeId"
            name="redeId"
            required
            defaultValue=""
            className={`${inputClass} [&>option]:text-black`}
          >
            <option value="" disabled>
              {redesParaLiderar.length === 0 ? "Nenhuma rede disponível" : "Selecione a rede"}
            </option>
            {redesParaLiderar.map((rede) => (
              <option key={rede.id} value={rede.id}>
                {rede.nome}
              </option>
            ))}
          </select>
        </Field>
      )}

      {liderDeRede === "nao" && (
        <>
          <p className="pl-3 text-xs font-medium text-white/70">
            Sem problema — de qual rede você participa?
          </p>

          <Field icon={<ChurchIcon className="h-5 w-5" />} error={state?.errors?.redeId?.[0]}>
            <select
              id="redeId"
              name="redeId"
              value={redeParticipaId}
              onChange={(event) => setRedeParticipaId(event.target.value)}
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
        </>
      )}

      <button
        type="submit"
        disabled={pending || !liderDeRede}
        className="mt-2 w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Continuar"}
      </button>
    </form>
  );
}
