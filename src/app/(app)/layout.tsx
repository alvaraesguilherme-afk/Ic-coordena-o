import type { ReactNode } from "react";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { SidebarFallback } from "@/components/sidebar-fallback";
import { UserBadge } from "@/components/user-badge";
import { AppShellBackground } from "@/components/app-shell-background";
import { BandeiraAnimada } from "@/components/bandeira-animada";
import { TabTransition } from "@/components/tab-transition";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShellBackground>
      <div className="relative flex w-full">
        <Suspense fallback={<SidebarFallback />}>
          <Sidebar />
        </Suspense>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-6 py-7 sm:px-10">
            <div className="flex items-center gap-3">
              <BandeiraAnimada width={44} aceso />
              <div className="leading-tight">
                <p className="text-base font-extrabold tracking-tight text-white">IMPULSE</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-yellow-300">Rede &apos;26</p>
              </div>
            </div>

            <Suspense fallback={<div className="h-14 w-14 animate-pulse rounded-full bg-white/[.06]" />}>
              <UserBadge />
            </Suspense>
          </header>

          <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden px-6 pb-24 sm:px-10 sm:pb-16">
            <Suspense fallback={<div className="min-w-0">{children}</div>}>
              <TabTransition>{children}</TabTransition>
            </Suspense>
          </main>
        </div>
      </div>
    </AppShellBackground>
  );
}
