import type { ReactNode } from "react";

// Fundo xadrez bordô da casca do app inteiro (atrás do header inclusive), em toda
// tela logada — não só o Início.
export function AppShellBackground({ children }: { children: ReactNode }) {
  return <div className="brand-checker-bg-maroon relative flex min-h-full flex-1 select-none">{children}</div>;
}
