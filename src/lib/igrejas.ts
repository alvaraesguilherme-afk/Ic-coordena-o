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

// "domingo"/"sábado" são masculinos ("todos os"); os demais dias são
// abreviação de "-feira", feminino ("todas as").
const DIA_SEMANA_TODOS: Record<DiaSemana, string> = {
  DOMINGO: "Todos os domingos",
  SEGUNDA: "Todas as segundas",
  TERCA: "Todas as terças",
  QUARTA: "Todas as quartas",
  QUINTA: "Todas as quintas",
  SEXTA: "Todas as sextas",
  SABADO: "Todos os sábados",
};

export function formatEncontroIC(diaSemana: DiaSemana, horario: string) {
  return `${DIA_SEMANA_TODOS[diaSemana]}, às ${horario}`;
}

export function redeNomeSemPrefixo(nome: string) {
  return nome.replace(/^rede\s+/i, "");
}
