export const DIAS_SEMANA = [
  "DOMINGO",
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number];

export const DIA_SEMANA_LABEL: Record<DiaSemana, string> = {
  DOMINGO: "Domingo",
  SEGUNDA: "Segunda-feira",
  TERCA: "Terça-feira",
  QUARTA: "Quarta-feira",
  QUINTA: "Quinta-feira",
  SEXTA: "Sexta-feira",
  SABADO: "Sábado",
};

const DIA_SEMANA_PLURAL: Record<DiaSemana, string> = {
  DOMINGO: "domingos",
  SEGUNDA: "segundas",
  TERCA: "terças",
  QUARTA: "quartas",
  QUINTA: "quintas",
  SEXTA: "sextas",
  SABADO: "sábados",
};

export function formatEncontroIC(diaSemana: DiaSemana, horario: string) {
  return `Todas as ${DIA_SEMANA_PLURAL[diaSemana]}, às ${horario}`;
}
