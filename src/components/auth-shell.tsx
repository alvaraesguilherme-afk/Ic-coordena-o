import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 justify-center bg-[#0a0e2e] px-4 py-10 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(34,211,238,0.28),transparent_45%)]" />
      </div>

      <div className="relative w-full max-w-sm self-center">
        <div className="pointer-events-none absolute -left-3 top-8 h-3/4 w-3 rounded-full bg-cyan-400/50 blur-xl sm:-left-4" />
        <div className="pointer-events-none absolute -right-3 top-8 h-3/4 w-3 rounded-full bg-cyan-400/50 blur-xl sm:-right-4" />

        <div className="relative rounded-[2rem] border border-white/15 bg-white/[.06] px-6 py-8 shadow-[0_0_90px_-25px_rgba(56,189,248,0.6)] backdrop-blur-2xl sm:rounded-[2.5rem] sm:px-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
