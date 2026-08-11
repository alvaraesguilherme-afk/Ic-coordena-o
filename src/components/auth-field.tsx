import type { ReactNode } from "react";

export function Field({
  icon,
  error,
  children,
}: {
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3 rounded-full border-2 border-white bg-white/5 px-5 py-2.5 focus-within:border-yellow-300">
        <span className="shrink-0 text-white/70">{icon}</span>
        {children}
      </div>
      {error && <p className="pl-3 text-xs font-medium text-yellow-200">{error}</p>}
    </div>
  );
}

export const authInputClass =
  "w-full bg-transparent font-brand text-sm font-bold uppercase tracking-wide text-white placeholder-white/60 outline-none";
