export const TIPOS_ESCALA = ["INTERCESSAO", "INTEGRACAO", "MIDIA"] as const;

// A escala de Mídia é organizada pela grade mensal (/escalas/midia), não por este formulário.
export const TIPOS_ESCALA_CRIAVEIS = ["INTERCESSAO", "INTEGRACAO"] as const;

export type TipoEscala = (typeof TIPOS_ESCALA)[number];

export const ESCALA_TIPO_LABEL: Record<TipoEscala, string> = {
  INTERCESSAO: "Intercessão",
  INTEGRACAO: "Integração",
  MIDIA: "Mídia",
};
