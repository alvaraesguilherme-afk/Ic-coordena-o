"use client";

import { useEffect, useRef, useState } from "react";

// Tempo máximo de segurança: se o vídeo não disparar "ended" (falha de
// carregamento, autoplay bloqueado etc.), a splash não pode ficar presa.
const TEMPO_MAXIMO_MS = 6000;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const maxTimer = setTimeout(() => setFading(true), TEMPO_MAXIMO_MS);
    return () => clearTimeout(maxTimer);
  }, []);

  useEffect(() => {
    if (!fading) return;
    const removeTimer = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(removeTimer);
  }, [fading]);

  // Alguns navegadores (principalmente mobile) só respeitam o atributo
  // `muted` declarativo de forma inconsistente na primeira renderização e
  // acabam bloqueando o autoplay, caindo no botão nativo de "play". Setar
  // `muted` e chamar `.play()` via ref garante o autoplay de verdade — e se
  // mesmo assim for bloqueado, pula direto pra tela em vez de deixar o
  // vídeo parado esperando um toque.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => setFading(true));
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        onEnded={() => setFading(true)}
        onPause={() => {
          if (!fading) videoRef.current?.play().catch(() => setFading(true));
        }}
        className="h-full w-full object-cover"
      >
        <source src="/brand/splash.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
