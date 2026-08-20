export const CATEGORIAS_LINK = ["DRIVES_ESCOLA_IMPULSE", "MINISTRACOES"] as const;

export type CategoriaLink = (typeof CATEGORIAS_LINK)[number];

export const CATEGORIA_LINK_LABEL: Record<CategoriaLink, string> = {
  DRIVES_ESCOLA_IMPULSE: "Drives Escola Impulse",
  MINISTRACOES: "Ministrações",
};

export const SLUG_POR_CATEGORIA_LINK: Record<CategoriaLink, string> = {
  DRIVES_ESCOLA_IMPULSE: "drives-escola-impulse",
  MINISTRACOES: "ministracoes",
};

export const CATEGORIA_LINK_POR_SLUG: Partial<Record<string, CategoriaLink>> = Object.fromEntries(
  CATEGORIAS_LINK.map((categoria) => [SLUG_POR_CATEGORIA_LINK[categoria], categoria])
);

export function podeGerenciarLinks(user: {
  isAdmin: boolean;
  role: string;
  supervisorMidia: boolean;
  supervisorIntegracao: boolean;
  supervisorIntercessao: boolean;
}) {
  return (
    user.isAdmin ||
    user.role === "LIDER" ||
    user.supervisorMidia ||
    user.supervisorIntegracao ||
    user.supervisorIntercessao
  );
}
