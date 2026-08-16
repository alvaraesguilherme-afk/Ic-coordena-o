import { HomeIcon, BellIcon, GearIcon, UsersIcon } from "@/components/icons";

export const NAV_ITEMS = [
  { href: "/inicio", label: "Início", Icon: HomeIcon },
  { href: "/membros", label: "Membros", Icon: UsersIcon },
  { href: "/novidades", label: "Mural", Icon: BellIcon },
  { href: "/configuracoes", label: "Configurações", Icon: GearIcon },
];

export const SIDEBAR_NAV_CLASSNAME =
  "fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#0c1445]/95 px-2 py-2 sm:static sm:inset-auto sm:w-20 sm:shrink-0 sm:flex-col sm:justify-start sm:gap-2 sm:border-t-0 sm:border-r sm:bg-white/[.04] sm:px-0 sm:py-6 sm:backdrop-blur-xl";
