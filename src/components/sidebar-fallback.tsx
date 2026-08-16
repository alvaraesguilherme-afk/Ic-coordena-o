import Link from "next/link";
import { NAV_ITEMS, SIDEBAR_NAV_CLASSNAME } from "@/components/sidebar-nav-items";

// Mesma marcação do Sidebar real, mas sem usePathname() — usado como fallback do
// Suspense pra não bloquear o shell estático da rota nenhuma (a versão com o item
// ativo destacado assume o lugar assim que o client hidrata, quase instantâneo).
export function SidebarFallback() {
  return (
    <nav
      className={SIDEBAR_NAV_CLASSNAME}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          title={label}
          className="group flex flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[10px] font-medium text-white/50 transition-transform active:scale-95 hover:bg-white/[.06] hover:text-white/80 sm:flex-none"
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
