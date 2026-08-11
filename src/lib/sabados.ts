export function sabadosDoMes(ano: number, mes: number) {
  // mes: 1-12
  const sabados: Date[] = [];
  const data = new Date(Date.UTC(ano, mes - 1, 1));
  while (data.getUTCMonth() === mes - 1) {
    if (data.getUTCDay() === 6) sabados.push(new Date(data));
    data.setUTCDate(data.getUTCDate() + 1);
  }
  return sabados;
}

export function dataKey(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function parseMesParam(mesParam: string | undefined) {
  const hoje = new Date();
  let ano = hoje.getUTCFullYear();
  let mes = hoje.getUTCMonth() + 1;

  if (mesParam && /^\d{4}-\d{2}$/.test(mesParam)) {
    const [anoStr, mesStr] = mesParam.split("-");
    ano = Number(anoStr);
    mes = Number(mesStr);
  }

  return { ano, mes };
}

export function mesAnterior(ano: number, mes: number) {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
}

export function mesSeguinte(ano: number, mes: number) {
  return mes === 12 ? { ano: ano + 1, mes: 1 } : { ano, mes: mes + 1 };
}

export function mesLabel(ano: number, mes: number) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(ano, mes - 1, 1)),
  );
}
