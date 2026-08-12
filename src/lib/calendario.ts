export { parseMesParam, mesAnterior, mesSeguinte, mesLabel, dataKey } from "@/lib/sabados";

export function diasDoMes(ano: number, mes: number) {
  // mes: 1-12
  const dias: Date[] = [];
  const data = new Date(Date.UTC(ano, mes - 1, 1));
  while (data.getUTCMonth() === mes - 1) {
    dias.push(new Date(data));
    data.setUTCDate(data.getUTCDate() + 1);
  }
  return dias;
}

/** 0 (domingo) a 6 (sábado) — pra alinhar o dia 1 na coluna certa da grade. */
export function diaDaSemanaDoPrimeiro(ano: number, mes: number) {
  return new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();
}

export function ehMesmoDiaEMes(data: Date, dia: number, mes: number) {
  return data.getUTCDate() === dia && data.getUTCMonth() === mes - 1;
}
