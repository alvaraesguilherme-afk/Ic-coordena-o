import type { ReactNode } from "react";
import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { UserBadge } from "@/components/user-badge";
import { AppShellBackground } from "@/components/app-shell-background";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShellBackground sidebar={<Sidebar />}>
      <header className="flex items-center justify-end gap-3 px-6 py-5 sm:px-10">
        <Suspense fallback={<div className="h-[52px] w-40 animate-pulse rounded-full bg-white/[.06]" />}>
          <UserBadge />
        </Suspense>
      </header>

      <main className="flex min-w-0 flex-1 flex-col px-6 pb-24 sm:px-10 sm:pb-16">{children}</main>
    </AppShellBackground>
  );
}
