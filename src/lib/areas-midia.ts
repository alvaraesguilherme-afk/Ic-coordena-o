export const AREAS_MIDIA = [
  "PROJECAO",
  "ILUMINACAO",
  "STORIES",
  "CAMERA_1",
  "CAMERA_2",
  "TRANSMISSAO",
  "FOTOGRAFIA",
] as const;

export type AreaMidia = (typeof AREAS_MIDIA)[number];

export const AREA_MIDIA_LABEL: Record<AreaMidia, string> = {
  PROJECAO: "Projeção",
  ILUMINACAO: "Iluminação",
  STORIES: "Stories",
  CAMERA_1: "Câmera 1",
  CAMERA_2: "Câmera 2",
  TRANSMISSAO: "Transmissão",
  FOTOGRAFIA: "Fotografia",
};
