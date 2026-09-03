import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hojeEmBRT, minutosAgoraBRT, minutosDoHorario } from "@/lib/frequencia";
import { DIAS_SEMANA } from "@/lib/igrejas";
import { sendPushToUsers } from "@/lib/push";

// Lembrete 20min ANTES do horário de cada IC — diferente do
// /api/cron/lembrete-frequencia (que roda 1x/dia num horário fixo), esse
// precisa acertar um alvo diferente por IC (cada uma tem seu próprio
// `horario`), então não dá pra usar o Vercel Cron do Hobby (só permite 1
// disparo fixo/dia por rota). Em vez disso essa rota é feita pra ser chamada
// com frequência (a cada ~10min) por um poller externo (GitHub Actions —
// ver .github/workflows/lembrete-frequencia-antes.yml) e decide sozinha, a
// cada chamada, se algum encontro está dentro da janela dos 20min-antes.
//
// Idempotência via `Reuniao.lembreteAntesEnviadoEm`: a primeira chamada que
// encontra o encontro dentro da janela manda o push e marca o campo — as
// chamadas seguintes no mesmo dia pulam, mesmo se caírem dentro da mesma
// janela de 20min (evita duplicar por causa do intervalo do poller).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const agora = new Date();
  const hoje = hojeEmBRT(agora);
  const diaSemanaHoje = DIAS_SEMANA[hoje.getUTCDay()];
  const minutoAgora = minutosAgoraBRT(agora);

  const igrejas = await prisma.igrejaCasa.findMany({
    where: { liderId: { not: null }, membros: { some: {} } },
    select: { id: true, nome: true, redeId: true, liderId: true, diaSemana: true, horario: true },
  });

  const lembretesEnviados: string[] = [];

  for (const igreja of igrejas) {
    const reuniaoHoje = await prisma.reuniao.findUnique({
      where: { igrejaId_data: { igrejaId: igreja.id, data: hoje } },
      select: { cancelada: true, lembreteAntesEnviadoEm: true },
    });

    const ehDiaOficial = igreja.diaSemana === diaSemanaHoje;
    const temEncontroHoje = ehDiaOficial ? !reuniaoHoje?.cancelada : !!reuniaoHoje && !reuniaoHoje.cancelada;
    if (!temEncontroHoje) continue;

    if (reuniaoHoje?.lembreteAntesEnviadoEm) continue;

    const minutoIc = minutosDoHorario(igreja.horario);
    const minutoAlvo = minutoIc - 20;

    // Só manda entre 20min-antes e o próprio horário da IC — antes disso
    // ainda não chegou a hora, depois disso o encontro já começou e o
    // lembrete "antes" perdeu o sentido.
    if (minutoAgora < minutoAlvo || minutoAgora >= minutoIc) continue;

    await prisma.reuniao.upsert({
      where: { igrejaId_data: { igrejaId: igreja.id, data: hoje } },
      update: { lembreteAntesEnviadoEm: agora },
      create: { igrejaId: igreja.id, data: hoje, lembreteAntesEnviadoEm: agora },
    });

    await sendPushToUsers([igreja.liderId!], {
      title: "Lembre-se de fazer a frequência",
      body: `Lembre-se de fazer a frequência da sua IC hoje.`,
      url: `/redes/${igreja.redeId}/igrejas/${igreja.id}/frequencia`,
    });
    lembretesEnviados.push(igreja.nome);
  }

  return NextResponse.json({
    data: hoje.toISOString().slice(0, 10),
    minutoAgora,
    icsProcessadas: igrejas.length,
    lembretesEnviados,
  });
}
