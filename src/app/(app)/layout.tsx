import type { ReactNode } from "react";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { UserBadge } from "@/components/user-badge";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 bg-[#0c1445]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(239,68,68,0.22),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(250,204,21,0.2),transparent_45%)]" />
      </div>

      <div className="relative flex w-full">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-end gap-3 px-6 py-5 sm:px-10">
            <Suspense fallback={<div className="h-[52px] w-40 animate-pulse rounded-full bg-white/[.06]" />}>
              <UserBadge />
            </Suspense>
          </header>

          <main className="flex flex-1 flex-col px-6 pb-16 sm:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
