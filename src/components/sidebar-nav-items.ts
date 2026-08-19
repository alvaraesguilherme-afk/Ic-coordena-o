import { MembrosSidebarIcon, InicioSidebarIcon, ConfiguracoesSidebarIcon, MuralSidebarIcon } from "@/components/icons";

export const NAV_ITEMS = [
  { href: "/inicio", label: "Início", Icon: InicioSidebarIcon },
  { href: "/membros", label: "Membros", Icon: MembrosSidebarIcon },
  { href: "/novidades", label: "Mural", Icon: MuralSidebarIcon },
  { href: "/configuracoes", label: "Configurações", Icon: ConfiguracoesSidebarIcon },
];

// `fixed` (celular) e `sm:relative` (desktop) já são, sozinhos, contextos de
// posicionamento válidos pro indicador `absolute` — nunca adicionar um `relative`
// avulso em cima disso: ele entra em conflito direto com `fixed` (mesma
// propriedade `position`) e quebra a barra por completo (deixa de flutuar fixa,
// vira um bloco normal no meio do layout).
export const SIDEBAR_NAV_CLASSNAME =
  "fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-red-600 px-2 py-2 sm:relative sm:inset-auto sm:w-20 sm:shrink-0 sm:flex-col sm:justify-start sm:gap-2 sm:border-t-0 sm:border-r sm:bg-red-600 sm:px-0 sm:py-6";
