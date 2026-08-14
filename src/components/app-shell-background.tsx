"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Fundo xadrez bordô cobrindo a casca inteira do app (atrás do header inclusive)
// só na tela de Início, igual à arte de referência — nas outras telas mantém o
// fundo navy padrão.
export function AppShellBackground({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isInicio = pathname === "/inicio";

  return (
    <div
      className={`relative flex min-h-full flex-1 select-none ${
        isInicio ? "brand-checker-bg-maroon" : "bg-[#0c1445]"
      }`}
    >
      {!isInicio && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(239,68,68,0.22),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(250,204,21,0.2),transparent_45%)]" />
        </div>
      )}

      {children}
    </div>
  );
}
