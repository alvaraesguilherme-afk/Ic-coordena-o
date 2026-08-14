import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DIAS_SEMANA } from "@/lib/igrejas";
import { meiaNoiteUTC, MS_POR_DIA } from "@/lib/frequencia";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dataAlvo = new Date(meiaNoiteUTC(new Date()).getTime() - MS_POR_DIA);
  const diaSemana = DIAS_SEMANA[dataAlvo.getUTCDay()];

  const igrejas = await prisma.igrejaCasa.findMany({
    where: { diaSemana },
    select: { id: true, membros: { select: { id: true } } },
  });

  let faltasCriadas = 0;
  for (const igreja of igrejas) {
    if (igreja.membros.length === 0) continue;

    const reuniao = await prisma.reuniao.upsert({
      where: { igrejaId_data: { igrejaId: igreja.id, data: dataAlvo } },
      update: {},
      create: { igrejaId: igreja.id, data: dataAlvo },
    });

    const resultado = await prisma.presenca.createMany({
      data: igreja.membros.map((membro) => ({
        reuniaoId: reuniao.id,
        userId: membro.id,
        presente: false,
      })),
      skipDuplicates: true,
    });
    faltasCriadas += resultado.count;
  }

  return NextResponse.json({
    data: dataAlvo.toISOString().slice(0, 10),
    icsProcessadas: igrejas.length,
    faltasCriadas,
  });
}
