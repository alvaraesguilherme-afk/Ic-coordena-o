"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Fundo xadrez bordô cobrindo o header + conteúdo (não a casca inteira) só na tela de
// Início, do tamanho exato do conteúdo — sem esticar pra preencher a tela toda quando o
// conteúdo é mais curto que a viewport (senão sobra xadrez vazio embaixo do último PNG).
// Nas outras telas mantém o fundo navy padrão, esticado a tela inteira como sempre.
export function AppShellBackground({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const isInicio = pathname === "/inicio";

  return (
    <div className="relative flex min-h-full flex-1 select-none bg-[#0c1445]">
      {!isInicio && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(239,68,68,0.22),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(250,204,21,0.2),transparent_45%)]" />
        </div>
      )}

      <div className="relative flex w-full">
        {sidebar}

        <div className={`flex min-w-0 flex-1 flex-col ${isInicio ? "brand-checker-bg-maroon self-start" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
