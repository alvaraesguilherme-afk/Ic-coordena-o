"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { HomeIcon, BellIcon, PersonIcon, GearIcon, LogoutIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/inicio", label: "Início", Icon: HomeIcon },
  { href: "/avisos", label: "Avisos", Icon: BellIcon },
  { href: "/perfil", label: "Perfil", Icon: PersonIcon },
  { href: "/configuracoes", label: "Configurações", Icon: GearIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 shrink-0 flex-col items-center justify-between border-r border-white/10 bg-white/[.04] py-6 backdrop-blur-xl sm:w-20">
      <nav className="flex flex-col items-center gap-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`group flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium transition-colors ${
                active
                  ? "bg-gradient-to-br from-sky-500/30 to-orange-400/30 text-white"
                  : "text-white/50 hover:bg-white/[.06] hover:text-white/80"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-sky-300" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          title="Sair"
          className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium text-white/50 transition-colors hover:bg-orange-500/15 hover:text-orange-300"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>Sair</span>
        </button>
      </form>
    </aside>
  );
}
