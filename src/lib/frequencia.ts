import { DIAS_SEMANA, type DiaSemana } from "@/lib/igrejas";

export const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function meiaNoiteUTC(data: Date) {
  return new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
}

// Meia-noite em horário de Brasília (não UTC) — vira o dia 3h mais tarde que
// meiaNoiteUTC, então usar essa aqui é o que faz a Lista de Frequência travar
// exatamente às 00:00 no relógio do líder, não às 21:00 do dia anterior.
export function hojeEmBRT(agora: Date = new Date()) {
  const dataStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
  return new Date(`${dataStr}T00:00:00.000Z`);
}

// Um encontro fica travado (não editável, nem por admin) assim que a data dele
// deixa de ser "hoje" em Brasília.
export function encontroTravado(data: Date, agora: Date = new Date()) {
  return data.getTime() < hojeEmBRT(agora).getTime();
}

export function encontroMaisRecente(diaSemana: DiaSemana, hoje: Date = new Date()) {
  const alvo = DIAS_SEMANA.indexOf(diaSemana);
  const base = meiaNoiteUTC(hoje);
  const diff = (base.getUTCDay() - alvo + 7) % 7;
  return new Date(base.getTime() - diff * MS_POR_DIA);
}

// Data do dia oficial da IC dentro da mesma semana (domingo-sábado) de
// `data` — normalmente é a própria `data` (já alinhada), mas quando ela veio
// de uma remarcação (ex: sexta virou quinta só naquela semana), isso "reancora"
// no dia oficial antes de pular pra semana anterior/seguinte, pra não
// perpetuar o dia remarcado indefinidamente ao navegar pelas setas.
function encontroDaSemana(data: Date, diaSemana: DiaSemana) {
  const alvo = DIAS_SEMANA.indexOf(diaSemana);
  const domingo = new Date(data.getTime() - data.getUTCDay() * MS_POR_DIA);
  return new Date(domingo.getTime() + alvo * MS_POR_DIA);
}

export function encontroAnterior(data: Date, diaSemana: DiaSemana) {
  return new Date(encontroDaSemana(data, diaSemana).getTime() - 7 * MS_POR_DIA);
}

export function encontroSeguinte(data: Date, diaSemana: DiaSemana) {
  return new Date(encontroDaSemana(data, diaSemana).getTime() + 7 * MS_POR_DIA);
}

// true quando `data` não cai no dia oficial da IC dentro da própria semana —
// ou seja, só pode ter chegado ali por uma remarcação (navegação por setas
// sempre re-ancora no dia oficial, ver encontroDaSemana acima).
export function foraDoCiclo(data: Date, diaSemana: DiaSemana) {
  return data.getUTCDay() !== DIAS_SEMANA.indexOf(diaSemana);
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

// Aceita qualquer data válida no parâmetro — não só o dia fixo da IC — pra dar
// espaço ao "Hoje" da Lista de Frequência: quando o encontro é remarcado pra
// outro dia da semana (ex: não deu na quinta, fizeram na sexta), o líder
// precisa conseguir marcar presença na data real do encontro, não só na data
// oficial. Sem isso, `encontroMaisRecente` sempre volta pro dia fixo e, se
// esse dia já passou, a Lista trava e não sobra nenhuma data editável.
export function parseDataParam(dataParam: string | undefined, diaSemana: DiaSemana) {
  if (dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam)) {
    const data = new Date(`${dataParam}T00:00:00.000Z`);
    if (!Number.isNaN(data.getTime())) {
      return data;
    }
  }
  return encontroMaisRecente(diaSemana);
}
