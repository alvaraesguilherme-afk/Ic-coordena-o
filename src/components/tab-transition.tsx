"use client";

import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { NAV_ITEMS } from "@/components/sidebar-nav-items";

// Toca uma animação CSS (transform/opacity só, ver globals.css) no conteúdo da
// aba sempre que a rota muda — sem desmontar nada aqui, é só uma classe alternada
// no mesmo nó do DOM. A direção do slide segue a posição das abas na barra inferior
// (entra da direita ao avançar, da esquerda ao voltar); fora da barra, um fade neutro.
//
// A classe é calculada durante a própria renderização (padrão oficial do React pra
// "ajustar estado a partir de uma prop que mudou", só grava na ref quando muda de
// verdade) em vez de um useEffect + setTimeout — isso evita a corrida em que o
// cronômetro desliga a animação antes do conteúdo real (ainda buscando no banco)
// chegar, fazendo ela tocar em cima do spinner de carregamento e não do conteúdo.
// Quem desliga a classe é o próprio fim da animação (onAnimationEnd), nunca um prazo
// fixo.
export function TabTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevIndexRef = useRef<number | null>(null);
  const [renderedFor, setRenderedFor] = useState<string | null>(null);
  const [animClass, setAnimClass] = useState("");

  if (pathname !== renderedFor) {
    const currentIndex = NAV_ITEMS.findIndex((item) => pathname?.startsWith(item.href));
    const prevIndex = prevIndexRef.current;

    if (currentIndex !== -1 && prevIndex !== null && prevIndex !== currentIndex) {
      setAnimClass(currentIndex > prevIndex ? "tab-slide-from-right" : "tab-slide-from-left");
    } else if (prevIndex !== null) {
      setAnimClass("tab-fade-in");
    }
    if (currentIndex !== -1) prevIndexRef.current = currentIndex;
    setRenderedFor(pathname);
  }

  return (
    <div className={`min-w-0 ${animClass}`} onAnimationEnd={() => setAnimClass("")}>
      {children}
    </div>
  );
}
