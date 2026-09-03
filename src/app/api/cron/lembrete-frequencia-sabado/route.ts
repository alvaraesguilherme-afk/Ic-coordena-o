import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hojeEmBRT } from "@/lib/frequencia";
import { DIAS_SEMANA } from "@/lib/igrejas";
import { sendPushToUsers } from "@/lib/push";

// Igual ao /api/cron/lembrete-frequencia, mas disparado às 17:00 BRT em vez
// de 22:30 — as ICs de sábado se reúnem à tarde, então "duas horas após o
// término" cai bem mais cedo que o lembrete padrão de encontro noturno. Rota
// separada (em vez de mudar a padrão) porque o Vercel Cron não dá pra ter
// dois horários pro mesmo path, e o usuário pediu explicitamente pra manter
// a rota das 22:30 exatamente como está.
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
