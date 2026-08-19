// Capas de links conhecidos, servidas como asset estático do app em vez do
// upload do usuário no Supabase Storage — evita a demora de carregar do
// Storage (ver [[impulse_r2_migration]]/feedback sobre cache). Casado por
// título normalizado (minúsculo, sem espaço nas pontas) porque o título
// gravado nem sempre bate maiúscula/minúscula certinho (ex.: "Escola impulse
// 2021" vs "Escola Impulse 2022").
const CAPA_POR_TITULO_LINK: Record<string, string> = {
  "escola impulse 2021": "/brand/links/escola-impulse-2021.jpg",
  "escola impulse 2022": "/brand/links/escola-impulse-2022.jpg",
  "escola impulse 2023": "/brand/links/escola-impulse-2023.jpg",
  "escola impulse 2024": "/brand/links/escola-impulse-2024.jpg",
};

export function capaEstaticaDoLink(titulo: string): string | undefined {
  return CAPA_POR_TITULO_LINK[titulo.trim().toLowerCase()];
}
