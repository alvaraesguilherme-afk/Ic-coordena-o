"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BellIcon, PersonIcon, GearIcon, UsersIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/inicio", label: "Início", Icon: HomeIcon },
  { href: "/membros", label: "Membros", Icon: UsersIcon },
  { href: "/novidades", label: "Mural", Icon: BellIcon },
  { href: "/perfil", label: "Perfil", Icon: PersonIcon },
  { href: "/configuracoes", label: "Configurações", Icon: GearIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#0c1445]/95 px-2 py-2 sm:static sm:inset-auto sm:w-20 sm:shrink-0 sm:flex-col sm:justify-start sm:gap-2 sm:border-t-0 sm:border-r sm:bg-white/[.04] sm:px-0 sm:py-6 sm:backdrop-blur-xl"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`group flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium transition-colors sm:flex-none ${
              active
                ? "bg-gradient-to-br from-red-500/30 to-yellow-400/30 text-white"
                : "text-white/50 hover:bg-white/[.06] hover:text-white/80"
            }`}
          >
            <Icon className={`h-5 w-5 ${active ? "text-yellow-300" : ""}`} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
