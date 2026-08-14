"use client";

import { useEffect, useState } from "react";
import { BandeiraAnimada } from "@/components/bandeira-animada";

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
      <BandeiraAnimada width={224} aceso />
    </div>
  );
}
