export const TIPOS_ESCALA = ["INTERCESSAO", "INTEGRACAO", "MIDIA"] as const;

export type TipoEscala = (typeof TIPOS_ESCALA)[number];

export const ESCALA_TIPO_LABEL: Record<TipoEscala, string> = {
  INTERCESSAO: "Intercessão",
  INTEGRACAO: "Integração",
  MIDIA: "Mídia",
};

// Intercessão e Integração são organizadas pela grade mensal por IC (/escalas/[tipoIc]),
// não por um formulário livre — mesma lógica que a Mídia já usa.
export const TIPOS_ESCALA_IC = ["INTEGRACAO", "INTERCESSAO"] as const;

export type TipoEscalaIc = (typeof TIPOS_ESCALA_IC)[number];

export const SLUG_POR_TIPO_IC: Record<TipoEscalaIc, string> = {
  INTEGRACAO: "integracao",
  INTERCESSAO: "intercessao",
};

export const TIPO_IC_POR_SLUG: Partial<Record<string, TipoEscalaIc>> = {
  integracao: "INTEGRACAO",
  intercessao: "INTERCESSAO",
};

export const VAGAS_IC = [1, 2] as const;

export function campoSupervisorIc(tipo: TipoEscalaIc): "supervisorIntegracao" | "supervisorIntercessao" {
  return tipo === "INTEGRACAO" ? "supervisorIntegracao" : "supervisorIntercessao";
}
