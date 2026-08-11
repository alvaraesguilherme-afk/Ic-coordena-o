export const TIPOS_ESCALA = ["INTERCESSAO", "INTEGRACAO", "MIDIA"] as const;

export type TipoEscala = (typeof TIPOS_ESCALA)[number];

export const ESCALA_TIPO_LABEL: Record<TipoEscala, string> = {
  INTERCESSAO: "Intercessão",
  INTEGRACAO: "Integração",
  MIDIA: "Mídia",
};
