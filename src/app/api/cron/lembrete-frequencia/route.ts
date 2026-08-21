import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hojeEmBRT } from "@/lib/frequencia";
import { DIAS_SEMANA } from "@/lib/igrejas";
import { sendPushToUsers } from "@/lib/push";

// Lembrete diário às 22:30 (BRT) pro líder de cada IC que tem encontro hoje
// (já considerando remarcação) e ainda não finalizou a frequência.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hoje = hojeEmBRT();
  const diaSemanaHoje = DIAS_SEMANA[hoje.getUTCDay()];

  const igrejas = await prisma.igrejaCasa.findMany({
    where: { liderId: { not: null }, membros: { some: {} } },
    select: { id: true, nome: true, redeId: true, liderId: true, diaSemana: true },
  });

  const lembretesEnviados: string[] = [];

  for (const igreja of igrejas) {
    const reuniaoHoje = await prisma.reuniao.findUnique({
      where: { igrejaId_data: { igrejaId: igreja.id, data: hoje } },
      select: { cancelada: true, finalizadaEm: true },
    });

    // Hoje só é dia de encontro dessa IC se: é o dia oficial dela (e não foi
    // remarcado pra outro dia) ou existe uma reunião remarcada pra hoje.
    const ehDiaOficial = igreja.diaSemana === diaSemanaHoje;
    const temEncontroHoje = ehDiaOficial ? !reuniaoHoje?.cancelada : !!reuniaoHoje && !reuniaoHoje.cancelada;
    if (!temEncontroHoje) continue;

    if (reuniaoHoje?.finalizadaEm) continue;

    await sendPushToUsers([igreja.liderId!], {
      title: "Não esqueça da frequência",
      body: `${igreja.nome} tem encontro hoje — não esqueça de marcar a frequência.`,
      url: `/redes/${igreja.redeId}/igrejas/${igreja.id}/frequencia`,
    });
    lembretesEnviados.push(igreja.nome);
  }

  return NextResponse.json({
    data: hoje.toISOString().slice(0, 10),
    icsProcessadas: igrejas.length,
    lembretesEnviados,
  });
}
