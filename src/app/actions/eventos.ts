"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventoFormSchema, type EventoFormState } from "@/lib/definitions";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { encontroDaSemana, formatDataFalta, MS_POR_DIA } from "@/lib/frequencia";
import { sendPushToUsers } from "@/lib/push";

async function podeGerenciarEventos(redeId: string) {
  const currentUser = await getUser();
  return currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === redeId);
}

// Evento "IC todos juntos": todas as ICs DAQUELA rede se juntam na data do
// evento em vez de se reunirem nos dias normais delas. Move a reunião de cada
// IC (a oficial da semana, ou a que já estava remarcada) pra data do evento,
// guardando de onde veio pra dar pra desfazer se o evento for cancelado (ver
// reverterIcsDoEvento).
async function moverIcsParaEvento(eventoId: string, redeId: string, dataEvento: Date, tituloEvento: string) {
  const igrejas = await prisma.igrejaCasa.findMany({
    where: { redeId },
    select: { id: true, nome: true, diaSemana: true, membros: { select: { id: true } } },
  });

  const domingo = encontroDaSemana(dataEvento, "DOMINGO");
  const sabado = new Date(domingo.getTime() + 6 * MS_POR_DIA);

  for (const igreja of igrejas) {
    const dataOficial = encontroDaSemana(dataEvento, igreja.diaSemana);
    if (dataOficial.getTime() === dataEvento.getTime()) continue;

    const reuniaoAtivaNaSemana = await prisma.reuniao.findFirst({
      where: { igrejaId: igreja.id, cancelada: false, data: { gte: domingo, lte: sabado } },
    });
    // Já fechou a frequência dessa semana — não mexe pra não apagar registro real.
    if (reuniaoAtivaNaSemana?.finalizadaEm) continue;

    const dataAtual = reuniaoAtivaNaSemana?.data ?? dataOficial;
    if (dataAtual.getTime() === dataEvento.getTime()) continue;

    const reuniaoAntiga = await prisma.reuniao.upsert({
      where: { igrejaId_data: { igrejaId: igreja.id, data: dataAtual } },
      update: { cancelada: true },
      create: { igrejaId: igreja.id, data: dataAtual, cancelada: true },
    });
    await prisma.presenca.deleteMany({ where: { reuniaoId: reuniaoAntiga.id } });

    await prisma.reuniao.upsert({
      where: { igrejaId_data: { igrejaId: igreja.id, data: dataEvento } },
      update: { cancelada: false, eventoId, dataAntesDoEvento: dataAtual },
      create: {
        igrejaId: igreja.id,
        data: dataEvento,
        cancelada: false,
        eventoId,
        dataAntesDoEvento: dataAtual,
      },
    });

    revalidatePath(`/redes/${redeId}/igrejas/${igreja.id}/frequencia`);

    if (igreja.membros.length > 0) {
      await sendPushToUsers(
        igreja.membros.map((m) => m.id),
        {
          title: "Reunião mudou de dia",
          body: `${igreja.nome} vai se juntar com as outras ICs em "${tituloEvento}" — a reunião dessa semana muda pra ${formatDataFalta(dataEvento)}.`,
          url: `/redes/${redeId}/igrejas/${igreja.id}/frequencia?data=${dataEvento.toISOString().slice(0, 10)}`,
        }
      );
    }
  }
}

// Desfaz o "IC todos juntos": cada IC que foi movida por esse evento volta
// pra data de antes (a oficial da semana, ou a remarcação manual que já
// existia — nunca a data original se ela já tinha sido remarcada antes do
// evento).
async function reverterIcsDoEvento(eventoId: string, redeId: string, tituloEvento: string) {
  const reunioesMovidas = await prisma.reuniao.findMany({
    where: { eventoId },
    include: { igreja: { select: { id: true, nome: true, membros: { select: { id: true } } } } },
  });

  for (const reuniao of reunioesMovidas) {
    // Já rolou e a frequência foi enviada — não desfaz, deixaria de existir o registro real.
    if (reuniao.finalizadaEm || !reuniao.dataAntesDoEvento) continue;

    await prisma.presenca.deleteMany({ where: { reuniaoId: reuniao.id } });
    await prisma.reuniao.update({
      where: { id: reuniao.id },
      data: { cancelada: true, eventoId: null, dataAntesDoEvento: null },
    });

    await prisma.reuniao.upsert({
      where: { igrejaId_data: { igrejaId: reuniao.igrejaId, data: reuniao.dataAntesDoEvento } },
      update: { cancelada: false },
      create: { igrejaId: reuniao.igrejaId, data: reuniao.dataAntesDoEvento, cancelada: false },
    });

    revalidatePath(`/redes/${redeId}/igrejas/${reuniao.igrejaId}/frequencia`);

    if (reuniao.igreja.membros.length > 0) {
      await sendPushToUsers(
        reuniao.igreja.membros.map((m) => m.id),
        {
          title: "Evento cancelado",
          body: `"${tituloEvento}" foi cancelado — a reunião de ${reuniao.igreja.nome} volta pra ${formatDataFalta(reuniao.dataAntesDoEvento)}.`,
          url: `/redes/${redeId}/igrejas/${reuniao.igrejaId}/frequencia?data=${reuniao.dataAntesDoEvento.toISOString().slice(0, 10)}`,
        }
      );
    }
  }
}

export async function createEvento(
  redeId: string,
  state: EventoFormState,
  formData: FormData
): Promise<EventoFormState> {
  if (!(await podeGerenciarEventos(redeId))) {
    return { message: "Você não pode criar eventos nessa rede." };
  }

  const validatedFields = EventoFormSchema.safeParse({
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    data: formData.get("data"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { titulo, tipo, data } = validatedFields.data;
  const dataEvento = new Date(data);

  const evento = await prisma.evento.create({
    data: { titulo, data: dataEvento, tipo, redeId },
  });

  if (tipo === "IC_TODOS_JUNTOS") {
    await moverIcsParaEvento(evento.id, redeId, dataEvento, titulo);
  }

  revalidatePath(`/redes/${redeId}/eventos`);
  redirect(`/redes/${redeId}/eventos`);
}

export async function deleteEvento(id: string, redeId: string) {
  if (!(await podeGerenciarEventos(redeId))) {
    return;
  }

  const evento = await prisma.evento.findUnique({
    where: { id },
    select: { id: true, titulo: true, tipo: true },
  });
  if (!evento) return;

  if (evento.tipo === "IC_TODOS_JUNTOS") {
    await reverterIcsDoEvento(evento.id, redeId, evento.titulo);
  }

  await prisma.evento.delete({ where: { id } });
  revalidatePath(`/redes/${redeId}/eventos`);
}
