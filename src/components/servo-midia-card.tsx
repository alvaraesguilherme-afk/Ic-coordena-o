"use client";

import { useState, useTransition, type TransitionStartFunction } from "react";
import { adicionarAreaMidia, removerAreaMidia, alterarNivelAreaMidia } from "@/app/actions/servo";
import { RemoverServoButton } from "@/components/remover-servo-button";
import { AREAS_MIDIA, AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";

type Nivel = "TREINEIRO" | "VETERANO";
type AreaServo = { area: AreaMidia; nivel: Nivel };

function AreaBadge({
  userId,
  area,
  nivel,
  isPending,
  startTransition,
}: {
  userId: string;
  area: AreaMidia;
  nivel: Nivel;
  isPending: boolean;
  startTransition: TransitionStartFunction;
}) {
  const veterano = nivel === "VETERANO";

  return (
    <span
      className={`flex items-center gap-0.5 rounded-lg py-1 pl-2.5 pr-1 text-xs ${
        veterano ? "bg-yellow-400/15 text-yellow-300" : "bg-white/10 text-white/60"
      }`}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => alterarNivelAreaMidia(userId, area))}
        title={veterano ? "Voltar para treinamento" : "Promover a veterano"}
        className="disabled:opacity-60"
      >
        {AREA_MIDIA_LABEL[area]}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => removerAreaMidia(userId, area))}
        aria-label={`Remover ${AREA_MIDIA_LABEL[area]}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base leading-none opacity-50 hover:bg-white/10 hover:text-red-300 hover:opacity-100 disabled:opacity-30"
      >
        ×
      </button>
    </span>
  );
}

export function ServoMidiaCard({
  userId,
  nome,
  areas,
}: {
  userId: string;
  nome: string;
  areas: AreaServo[];
}) {
  const [isPending, startTransition] = useTransition();
  const [adicionando, setAdicionando] = useState(false);

  const veteranas = areas.filter((a) => a.nivel === "VETERANO");
  const treinando = areas.filter((a) => a.nivel === "TREINEIRO");
  const disponiveis = AREAS_MIDIA.filter((a) => !areas.some((x) => x.area === a));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-white">{nome}</p>
        <RemoverServoButton userId={userId} nome={nome} />
      </div>

      {veteranas.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-yellow-300/60">Veterano</p>
          <div className="flex flex-wrap gap-1.5">
            {veteranas.map((a) => (
              <AreaBadge
                key={a.area}
                userId={userId}
                area={a.area}
                nivel={a.nivel}
                isPending={isPending}
                startTransition={startTransition}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Em treinamento</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {treinando.map((a) => (
            <AreaBadge
              key={a.area}
              userId={userId}
              area={a.area}
              nivel={a.nivel}
              isPending={isPending}
              startTransition={startTransition}
            />
          ))}

          {adicionando ? (
            <select
              autoFocus
              disabled={isPending}
              defaultValue=""
              onChange={(e) => {
                const area = e.target.value as AreaMidia;
                if (area) startTransition(() => adicionarAreaMidia(userId, area));
                setAdicionando(false);
              }}
              onBlur={() => setAdicionando(false)}
              className="rounded-lg border border-white/15 bg-white/95 px-2 py-1.5 text-xs text-black outline-none"
            >
              <option value="">Escolher...</option>
              {disponiveis.map((a) => (
                <option key={a} value={a}>
                  {AREA_MIDIA_LABEL[a]}
                </option>
              ))}
            </select>
          ) : (
            disponiveis.length > 0 && (
              <button
                type="button"
                onClick={() => setAdicionando(true)}
                aria-label="Adicionar área"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/15 text-base leading-none text-white/50 hover:border-yellow-400/40 hover:text-yellow-300"
              >
                +
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
