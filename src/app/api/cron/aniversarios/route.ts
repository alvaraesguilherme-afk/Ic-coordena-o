import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hojeEmBRT } from "@/lib/frequencia";
import { listaComE } from "@/lib/user";
import { sendPushToUsers } from "@/lib/push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const hoje = hojeEmBRT();
  const mes = hoje.getUTCMonth();
  const dia = hoje.getUTCDate();

  const pessoas = await prisma.user.findMany({
    where: { birthDate: { not: null }, redeId: { not: null } },
    select: { id: true, name: true, redeId: true, birthDate: true },
  });

  const aniversariantesPorRede = new Map<string, { id: string; name: string }[]>();
  for (const pessoa of pessoas) {
    if (pessoa.birthDate!.getUTCMonth() !== mes || pessoa.birthDate!.getUTCDate() !== dia) continue;
    const lista = aniversariantesPorRede.get(pessoa.redeId!) ?? [];
    lista.push({ id: pessoa.id, name: pessoa.name });
    aniversariantesPorRede.set(pessoa.redeId!, lista);
  }

  let notificacoesEnviadas = 0;
  await Promise.all(
    [...aniversariantesPorRede.entries()].map(async ([redeId, aniversariantes]) => {
      const membrosDaRede = await prisma.user.findMany({
        where: { redeId },
        select: { id: true },
      });
      const aniversarianteIds = new Set(aniversariantes.map((p) => p.id));
      const destinatarios = membrosDaRede
        .map((m) => m.id)
        .filter((id) => !aniversarianteIds.has(id));
      if (destinatarios.length === 0) return;

      notificacoesEnviadas += destinatarios.length;
      await sendPushToUsers(destinatarios, {
        title: "Aniversário na sua rede",
        body: `Hoje é aniversário de ${listaComE(aniversariantes.map((p) => p.name))}! 🎂`,
        url: "/inicio",
      });
    })
  );

  return NextResponse.json({
    data: `${hoje.getUTCFullYear()}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`,
    redesComAniversario: aniversariantesPorRede.size,
    notificacoesEnviadas,
  });
}
