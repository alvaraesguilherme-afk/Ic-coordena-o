"use client";

import { useEffect, useState } from "react";

// Tempo máximo de segurança: se o vídeo não disparar "ended" (falha de
// carregamento, autoplay bloqueado etc.), a splash não pode ficar presa.
const TEMPO_MAXIMO_MS = 6000;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const maxTimer = setTimeout(() => setFading(true), TEMPO_MAXIMO_MS);
    return () => clearTimeout(maxTimer);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const removeTimer = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(removeTimer);
  }, [fading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <video
        autoPlay
        muted
        playsInline
        onEnded={() => setFading(true)}
        className="h-full w-full object-cover"
      >
        <source src="/brand/splash.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
