import type { ReactNode } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { UserBadge } from "@/components/user-badge";
import { AppShellBackground } from "@/components/app-shell-background";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShellBackground>
      <div className="relative flex w-full">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-6 py-5 sm:px-10">
            <div className="flex items-center gap-2">
              <Image src="/brand/logo-impulse.png" alt="" width={36} height={32} className="h-8 w-auto drop-shadow" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold tracking-tight text-white">IMPULSE</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-yellow-300">Rede &apos;26</p>
              </div>
            </div>

            <Suspense fallback={<div className="h-11 w-11 animate-pulse rounded-full bg-white/[.06]" />}>
              <UserBadge />
            </Suspense>
          </header>

          <main className="flex min-w-0 flex-1 flex-col px-6 pb-24 sm:px-10 sm:pb-16">{children}</main>
        </div>
      </div>
    </AppShellBackground>
  );
}
