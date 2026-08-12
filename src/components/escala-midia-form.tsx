"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { salvarEscalaMidia } from "@/app/actions/escala-midia";
import { removerEscalaMidia } from "@/app/actions/escala-midia";
import { AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";
import { AREA_PARA_FUNCAO, type FuncaoMidia } from "@/lib/funcoes-midia";

type Servo = {
  id: string;
  name: string;
  areasServoMidia: { area: FuncaoMidia; nivel: "TREINEIRO" | "VETERANO" }[];
};

const inputClass =
  "rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none [&>option]:text-black";

export function EscalaMidiaForm({
  area,
  data,
  mes,
  servos,
  entradaId,
  escaladoIdAtual,
  treinandoIdAtual,
}: {
  area: AreaMidia;
  data: string;
  mes?: string;
  servos: Servo[];
  entradaId?: string;
  escaladoIdAtual?: string;
  treinandoIdAtual?: string;
}) {
  const [state, action, pending] = useActionState(salvarEscalaMidia, undefined);
  const [isRemoving, startRemoveTransition] = useTransition();
  const router = useRouter();

  const funcao = AREA_PARA_FUNCAO[area];
  const veteranosDaArea = servos.filter((s) =>
    s.areasServoMidia.some((a) => a.area === funcao && a.nivel === "VETERANO"),
  );
  const treineirosDaArea = servos.filter((s) =>
    s.areasServoMidia.some((a) => a.area === funcao && a.nivel === "TREINEIRO"),
  );

  const voltarHref = `/escalas/midia${mes ? `?mes=${mes}` : ""}`;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="area" value={area} />
      <input type="hidden" name="data" value={data} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="escaladoId" className="text-sm font-medium text-white/80">
          Escalado
        </label>
        <select
          id="escaladoId"
          name="escaladoId"
          required
          defaultValue={escaladoIdAtual ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {veteranosDaArea.length === 0 ? (
            <option value="" disabled>
              Nenhum veterano de {AREA_MIDIA_LABEL[area]} ainda
            </option>
          ) : (
            veteranosDaArea.map((servo) => (
              <option key={servo.id} value={servo.id}>
                {servo.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="treinandoId" className="text-sm font-medium text-white/80">
          Treinamento (opcional)
        </label>
        <select id="treinandoId" name="treinandoId" defaultValue={treinandoIdAtual ?? ""} className={inputClass}>
          <option value="">Nenhum</option>
          {treineirosDaArea.map((servo) => (
            <option key={servo.id} value={servo.id}>
              {servo.name}
            </option>
          ))}
        </select>
      </div>

      {state?.message && <p className="text-sm text-red-300">{state.message}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>

        {entradaId && (
          <button
            type="button"
            disabled={isRemoving}
            onClick={() =>
              startRemoveTransition(async () => {
                await removerEscalaMidia(entradaId);
                router.push(voltarHref);
              })
            }
            className="rounded-full border border-red-400/40 px-5 py-2 text-sm font-medium text-red-300 hover:bg-red-400/10 disabled:opacity-60"
          >
            {isRemoving ? "Removendo..." : "Remover"}
          </button>
        )}
      </div>
    </form>
  );
}
