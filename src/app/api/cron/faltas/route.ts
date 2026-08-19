import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DIAS_SEMANA } from "@/lib/igrejas";
import { meiaNoiteUTC, MS_POR_DIA } from "@/lib/frequencia";
import { sendPushToUsers } from "@/lib/push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const dataAlvo = new Date(meiaNoiteUTC(new Date()).getTime() - MS_POR_DIA);
  const diaSemana = DIAS_SEMANA[dataAlvo.getUTCDay()];

  const igrejas = await prisma.igrejaCasa.findMany({
    where: { diaSemana },
    select: { id: true, nome: true, membros: { select: { id: true } } },
  });

  let faltasCriadas = 0;
  // ICs onde ninguém marcou nem um presente/falta manualmente antes deste cron
  // rodar — ou seja, o líder não abriu a Lista de Frequência nesse dia. Precisa
  // ser checado ANTES do createMany abaixo, que preenche tudo como falta pra
  // todo mundo (skipDuplicates preserva o que o líder já marcou).
  const icsSemFrequencia: string[] = [];

  for (const igreja of igrejas) {
    if (igreja.membros.length === 0) continue;

    const reuniao = await prisma.reuniao.upsert({
      where: { igrejaId_data: { igrejaId: igreja.id, data: dataAlvo } },
      update: {},
      create: { igrejaId: igreja.id, data: dataAlvo },
    });

    const jaMarcados = await prisma.presenca.count({ where: { reuniaoId: reuniao.id } });
    if (jaMarcados === 0) {
      icsSemFrequencia.push(igreja.nome);
    }

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

  if (icsSemFrequencia.length > 0) {
    const admins = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true } });
    await sendPushToUsers(
      admins.map((a) => a.id),
      {
        title: "Frequência não preenchida",
        body: `${icsSemFrequencia.length === 1 ? "1 IC não marcou" : `${icsSemFrequencia.length} ICs não marcaram`} a frequência ontem: ${icsSemFrequencia.join(", ")}`,
        url: "/frequencia",
      }
    );
  }

  return NextResponse.json({
    data: dataAlvo.toISOString().slice(0, 10),
    icsProcessadas: igrejas.length,
    faltasCriadas,
    icsSemFrequencia,
  });
}
