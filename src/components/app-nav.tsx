import Link from "next/link";
import { logout } from "@/app/actions/auth";

export function AppNav({
  active,
  userName,
  userRole,
}: {
  active: "membros" | "reunioes";
  userName: string;
  userRole: "LIDER" | "MEMBRO";
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-black/10 pb-4 dark:border-white/15 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-6">
        <nav className="flex gap-4 text-sm font-medium">
          <Link
            href="/membros"
            className={active === "membros" ? "underline underline-offset-4" : "text-zinc-600 hover:underline dark:text-zinc-400"}
          >
            Membros
          </Link>
          <Link
            href="/reunioes"
            className={active === "reunioes" ? "underline underline-offset-4" : "text-zinc-600 hover:underline dark:text-zinc-400"}
          >
            Reuniões
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {userName} ({userRole === "LIDER" ? "Líder" : "Membro"})
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-[#1a1a1a]"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
