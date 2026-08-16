"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { NAV_ITEMS, SIDEBAR_NAV_CLASSNAME } from "@/components/sidebar-nav-items";

type PillRect = { x: number; y: number; w: number; h: number };

export function Sidebar() {
  const pathname = usePathname();
  // Estado otimista: muda no mesmo clique, sem esperar a navegação terminar.
  // usePathname() só reflete a rota depois que o conteúdo novo já está pronto
  // (fica "atrasado" em telas mais lentas) — isso corrige pra ficar instantâneo.
  // Sincronizado de volta durante a própria renderização (cobre voltar/avançar do
  // navegador) em vez de um useEffect — evita disparar uma renderização extra.
  const [activeHref, setActiveHref] = useState(pathname);
  const [syncedFor, setSyncedFor] = useState(pathname);
  if (pathname !== syncedFor) {
    setActiveHref(pathname);
    setSyncedFor(pathname);
  }

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Partial<Record<string, HTMLAnchorElement | null>>>({});
  const [pill, setPill] = useState<PillRect | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const nav = navRef.current;
      const activeItem = NAV_ITEMS.find((item) => activeHref?.startsWith(item.href));
      const el = activeItem ? itemRefs.current[activeItem.href] : null;
      if (!nav || !el) return;
      const navRect = nav.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setPill({
        x: itemRect.left - navRect.left,
        y: itemRect.top - navRect.top,
        w: itemRect.width,
        h: itemRect.height,
      });
    }

    measure();
    // A barra vira coluna (desktop) ou fileira (celular) por breakpoint — remedir
    // ao redimensionar/virar a tela cobre a troca de layout, não só a de aba.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeHref]);

  return (
    <nav
      ref={navRef}
      className={SIDEBAR_NAV_CLASSNAME}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {/* Indicador único que desliza até a aba ativa — só `transform` anima (nunca
          width/height/top/left), a posição é medida de verdade em vez de calculada
          por índice, então funciona igual na barra de baixo e na lateral. Dividido
          em dois nós: o de fora só se move (transition no transform); o de dentro
          tem o aspecto de vidro e "dilata" levemente a cada troca — troca de `key`
          a cada nova posição pra sempre reiniciar essa animação de verdade (evita a
          mesma corrida de timing já corrigida no TabTransition). */}
      {pill && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: pill.w, height: pill.h, transform: `translate(${pill.x}px, ${pill.y}px)` }}
        >
          <div
            key={`${pill.x}-${pill.y}`}
            className="pill-dilate h-full w-full rounded-2xl border border-white/25 bg-gradient-to-br from-red-500/25 to-yellow-400/25 shadow-lg shadow-black/20 backdrop-blur-md"
          />
        </div>
      )}

      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = activeHref?.startsWith(href);
        return (
          <Link
            key={href}
            ref={(el) => {
              itemRefs.current[href] = el;
            }}
            href={href}
            title={label}
            onClick={() => setActiveHref(href)}
            className={`group relative z-10 flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium transition-transform active:scale-95 sm:flex-none ${
              active ? "text-white" : "text-white/50 hover:bg-white/[.06] hover:text-white/80"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "text-yellow-300" : ""}`} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
