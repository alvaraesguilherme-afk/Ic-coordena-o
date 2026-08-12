import type { AreaMidia } from "./areas-midia";

export const FUNCOES_MIDIA = [
  "PROJECAO",
  "ILUMINACAO",
  "STORIES",
  "CAMERA",
  "TRANSMISSAO",
  "FOTOGRAFIA",
] as const;

export type FuncaoMidia = (typeof FUNCOES_MIDIA)[number];

export const FUNCAO_MIDIA_LABEL: Record<FuncaoMidia, string> = {
  PROJECAO: "Projeção",
  ILUMINACAO: "Iluminação",
  STORIES: "Stories",
  CAMERA: "Câmera",
  TRANSMISSAO: "Transmissão",
  FOTOGRAFIA: "Fotografia",
};

// Qual função cobre cada posto da grade — Câmera 1 e Câmera 2 são o mesmo servo
export const AREA_PARA_FUNCAO: Record<AreaMidia, FuncaoMidia> = {
  PROJECAO: "PROJECAO",
  ILUMINACAO: "ILUMINACAO",
  STORIES: "STORIES",
  CAMERA_1: "CAMERA",
  CAMERA_2: "CAMERA",
  TRANSMISSAO: "TRANSMISSAO",
  FOTOGRAFIA: "FOTOGRAFIA",
};
