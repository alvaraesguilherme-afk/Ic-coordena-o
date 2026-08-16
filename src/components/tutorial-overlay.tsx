"use client";

import { useEffect, useState } from "react";
import { BandeiraAnimada } from "@/components/bandeira-animada";
import { marcarTutorialVisto } from "@/app/actions/tutorial";

type Fase = "carregando" | "voando" | "fechando";

// Continua visualmente a tela de carregamento real: a MESMA BandeiraAnimada que
// tremula centralizada (fase "carregando") depois decola e cresce (fase "voando"),
// revelando o tutorial por trás através de um clip-path circular que cresce a
// partir do mesmo ponto — nunca troca de elemento nem dá um corte seco.
export function TutorialOverlay({
  pagina,
  jaViu,
  titulo,
  linhas,
  cta,
}: {
  pagina: string;
  jaViu: boolean;
  titulo: string;
  linhas: string[];
  cta: string;
}) {
  const [visivel, setVisivel] = useState(!jaViu);
  const [fase, setFase] = useState<Fase>("carregando");

  useEffect(() => {
    if (!visivel) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setFase("voando"), reducedMotion ? 50 : 900);
    return () => clearTimeout(timer);
  }, [visivel]);

  if (!visivel) return null;

  function fechar() {
    setFase("fechando");
    marcarTutorialVisto(pagina);
    setTimeout(() => setVisivel(false), 400);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#080d30]">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 transition-[transform,opacity] duration-[620ms] ease-[cubic-bezier(0.5,0,0.85,0.35)] ${
          fase === "carregando" ? "scale-100 opacity-100" : "scale-[30] opacity-0"
        }`}
      >
        <BandeiraAnimada width={72} aceso={fase === "carregando"} />
        <p
          className={`text-[11px] tracking-wide text-white/40 transition-opacity duration-200 ${
            fase === "carregando" ? "" : "opacity-0"
          }`}
        >
          Carregando…
        </p>
      </div>

      <div
        className={`brand-checker-bg-maroon absolute inset-0 flex items-center px-7 transition-[clip-path] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          fase === "voando" ? "[clip-path:circle(75%_at_50%_50%)]" : "[clip-path:circle(0%_at_50%_50%)]"
        }`}
      >
        <div className="mx-auto flex max-w-xs flex-col gap-3">
          <h2 className="font-brand text-lg font-extrabold text-white">{titulo}</h2>
          {linhas.map((linha, i) => (
            <p
              key={linha}
              className="tutorial-line text-sm leading-relaxed text-white/70"
              style={{ animationDelay: `${900 + i * 1150}ms` }}
            >
              {linha}
            </p>
          ))}
          <button
            onClick={fechar}
            className="tutorial-line mt-2 self-start rounded-full bg-yellow-400 px-5 py-2 text-sm font-extrabold text-[#1a1200]"
            style={{ animationDelay: `${900 + linhas.length * 1150}ms` }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
