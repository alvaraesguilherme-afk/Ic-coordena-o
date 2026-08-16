"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS, SIDEBAR_NAV_CLASSNAME } from "@/components/sidebar-nav-items";

type Axis = { pos: number; vel: number };

// Mola crítica-ish: em vez de uma curva de easing fixa, a posição reage à própria
// velocidade a cada quadro — é isso que dá o efeito "gota de vidro" (estica na
// direção que anda, volta a ser um pingo redondo ao travar), não um keyframe.
function springStep(axis: Axis, target: number, dt: number) {
  const stiffness = 210;
  const damping = 24;
  const force = (target - axis.pos) * stiffness - axis.vel * damping;
  axis.vel += force * dt;
  axis.pos += axis.vel * dt;
}

function settled(axis: Axis, target: number) {
  return Math.abs(target - axis.pos) < 0.35 && Math.abs(axis.vel) < 6;
}

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
  const pillRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const springX = useRef<Axis>({ pos: 0, vel: 0 });
  const springY = useRef<Axis>({ pos: 0, vel: 0 });
  const targetRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const hasPositionedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function measure() {
      const nav = navRef.current;
      const item = NAV_ITEMS.find((n) => activeHref?.startsWith(n.href));
      const el = item ? itemRefs.current[item.href] : null;
      if (!nav || !el || !pillRef.current) return false;
      const navRect = nav.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      targetRef.current = {
        x: itemRect.left - navRect.left,
        y: itemRect.top - navRect.top,
        w: itemRect.width,
        h: itemRect.height,
      };
      pillRef.current.style.width = `${targetRef.current.w}px`;
      pillRef.current.style.height = `${targetRef.current.h}px`;
      return true;
    }

    function render() {
      const pill = pillRef.current;
      const inner = innerRef.current;
      if (!pill || !inner) return;
      pill.style.transform = `translate(${springX.current.pos}px, ${springY.current.pos}px)`;

      const vx = springX.current.vel;
      const vy = springY.current.vel;
      const speed = Math.hypot(vx, vy);
      const stretch = Math.min(1 + speed / 900, 1.55);
      const squash = Math.max(1 - speed / 2600, 0.74);
      inner.style.transform =
        Math.abs(vx) >= Math.abs(vy)
          ? `scaleX(${stretch}) scaleY(${squash})`
          : `scaleX(${squash}) scaleY(${stretch})`;
    }

    function loop(t: number) {
      const dt = Math.min((t - lastTimeRef.current) / 1000, 1 / 30);
      lastTimeRef.current = t;
      const target = targetRef.current;
      springStep(springX.current, target.x, dt);
      springStep(springY.current, target.y, dt);
      render();
      if (!settled(springX.current, target.x) || !settled(springY.current, target.y)) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        springX.current = { pos: target.x, vel: 0 };
        springY.current = { pos: target.y, vel: 0 };
        render();
        if (innerRef.current) innerRef.current.style.transform = "";
        rafRef.current = null;
      }
    }

    function snapOrAnimate() {
      if (!measure()) return;
      const target = targetRef.current;
      // Primeira posição (ou usuário pediu menos movimento): sem voo, só aparece
      // no lugar certo.
      if (!hasPositionedRef.current || reducedMotion) {
        hasPositionedRef.current = true;
        springX.current = { pos: target.x, vel: 0 };
        springY.current = { pos: target.y, vel: 0 };
        render();
        return;
      }
      if (rafRef.current == null) {
        lastTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    snapOrAnimate();
    // A barra vira coluna (desktop) ou fileira (celular) por breakpoint — remedir
    // ao redimensionar/virar a tela cobre a troca de layout, não só a de aba.
    window.addEventListener("resize", snapOrAnimate);
    return () => {
      window.removeEventListener("resize", snapOrAnimate);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [activeHref]);

  return (
    <nav
      ref={navRef}
      className={SIDEBAR_NAV_CLASSNAME}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {/* "Gota": indicador de vidro com física de mola real (posição/velocidade
          recalculadas a cada quadro via rAF, não uma curva de easing fixa) — estica
          na direção que anda e volta a ser um pingo redondo ao travar. Dividido em
          dois nós: o de fora só se posiciona (translate puro); o de dentro recebe o
          scaleX/scaleY calculado a partir da velocidade atual. */}
      <div ref={pillRef} aria-hidden className="pointer-events-none absolute top-0 left-0" style={{ width: 0, height: 0 }}>
        <div
          ref={innerRef}
          className="h-full w-full rounded-full border border-white/40 backdrop-blur-lg"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 60%), linear-gradient(135deg, rgba(239,68,68,0.32), rgba(250,204,21,0.32))",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.15)",
          }}
        />
      </div>

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
