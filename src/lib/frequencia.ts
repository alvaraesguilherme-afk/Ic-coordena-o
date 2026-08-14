import { DIAS_SEMANA, type DiaSemana } from "@/lib/igrejas";

export const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function meiaNoiteUTC(data: Date) {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}

export function encontroMaisRecente(diaSemana: DiaSemana, hoje: Date = new Date()) {
  const alvo = DIAS_SEMANA.indexOf(diaSemana);
  const base = meiaNoiteUTC(hoje);
  const diff = (base.getUTCDay() - alvo + 7) % 7;
  return new Date(base.getTime() - diff * MS_POR_DIA);
}

export function encontroAnterior(data: Date) {
  return new Date(data.getTime() - 7 * MS_POR_DIA);
}

export function encontroSeguinte(data: Date) {
  return new Date(data.getTime() + 7 * MS_POR_DIA);
}

export function formatDataEncontro(data: Date, horario: string) {
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(data);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}, às ${horario}`;
}

export function formatDataFalta(data: Date) {
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(data);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function parseDataParam(dataParam: string | undefined, diaSemana: DiaSemana) {
  if (dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam)) {
    const data = new Date(`${dataParam}T00:00:00.000Z`);
    if (!Number.isNaN(data.getTime()) && data.getUTCDay() === DIAS_SEMANA.indexOf(diaSemana)) {
      return data;
    }
  }
  return encontroMaisRecente(diaSemana);
}
