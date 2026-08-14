"use client";

import { useEffect, useRef } from "react";

const LOGO_SRC = "/brand/logo-impulse.png";
const LOGO_ASPECT = 792 / 1122;
const TIRAS = 26;

// Bandeira do Impulse tremulando: a imagem é fatiada em tiras verticais que
// giram em leve 3D com atraso progressivo entre elas, simulando pano ao
// vento — presa perto do "mastro" (amplitude ~0) e livre na ponta.
export function BandeiraAnimada({
  width = 260,
  aceso = true,
  className = "",
}: {
  width?: number;
  aceso?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const altura = Math.round(width * LOGO_ASPECT);
    const larguraTira = width / TIRAS;

    wrap.style.width = `${width}px`;
    wrap.style.height = `${altura}px`;
    wrap.innerHTML = "";

    for (let i = 0; i < TIRAS; i++) {
      const tira = document.createElement("div");
      tira.className = "bandeira-strip";
      tira.style.left = `${i * larguraTira}px`;
      tira.style.width = `${larguraTira + 0.6}px`;
      tira.style.backgroundImage = `url(${LOGO_SRC})`;
      tira.style.backgroundSize = `${width}px ${altura}px`;
      tira.style.backgroundPosition = `${-(i * larguraTira)}px 0`;
      const amplitude = Math.round((i / (TIRAS - 1)) * 20);
      tira.style.setProperty("--amp", String(amplitude));
      tira.style.animationDelay = `${i * -0.08}s`;
      wrap.appendChild(tira);
    }
  }, [width]);

  return (
    <div className={`bandeira-perspective ${aceso ? "bandeira-on" : ""} ${className}`}>
      <div ref={wrapRef} className="bandeira-strips" />
    </div>
  );
}
