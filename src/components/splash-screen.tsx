"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3000);
    const removeTimer = setTimeout(() => setVisible(false), 3500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-[radial-gradient(circle_at_center,#0c26b0_0%,#050814_70%,#000000_100%)] transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <Image
        src="/brand/logo-impulse.png"
        alt="Impulse"
        width={1122}
        height={792}
        priority
        unoptimized
        className="h-auto w-56 drop-shadow-[0_0_30px_rgba(250,204,21,0.35)]"
      />
    </div>
  );
}
