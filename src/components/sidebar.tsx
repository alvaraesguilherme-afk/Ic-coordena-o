"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS, SIDEBAR_NAV_CLASSNAME } from "@/components/sidebar-nav-items";

export function Sidebar() {
  const pathname = usePathname();
  // Estado otimista: muda no mesmo clique, sem esperar a navegação terminar.
  // usePathname() só reflete a rota depois que o conteúdo novo já está pronto
  // (fica "atrasado" em telas mais lentas) — isso corrige pra ficar instantâneo,
  // e se sincroniza de volta pelo useEffect (cobre voltar/avançar do navegador).
  const [activeHref, setActiveHref] = useState(pathname);

  useEffect(() => {
    setActiveHref(pathname);
  }, [pathname]);

  return (
    <nav
      className={SIDEBAR_NAV_CLASSNAME}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = activeHref?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            onClick={() => setActiveHref(href)}
            className={`group flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium transition-transform active:scale-95 sm:flex-none ${
              active
                ? "bg-gradient-to-br from-red-500/30 to-yellow-400/30 text-white"
                : "text-white/50 hover:bg-white/[.06] hover:text-white/80"
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
