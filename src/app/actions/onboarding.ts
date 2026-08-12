"use server";

import { redirect } from "next/navigation";
import {
  OnboardingMembroFormSchema,
  OnboardingLiderFormSchema,
  type OnboardingMembroFormState,
  type OnboardingLiderFormState,
} from "@/lib/definitions";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { sendPushToUsers } from "@/lib/push";

export async function completarOnboardingMembro(
  state: OnboardingMembroFormState,
  formData: FormData
) {
  const session = await verifySession();

  const validatedFields = OnboardingMembroFormSchema.safeParse({
    redeId: formData.get("redeId"),
    igrejaId: formData.get("igrejaId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { redeId, igrejaId } = validatedFields.data;

  const igreja = await prisma.igrejaCasa.findUnique({ where: { id: igrejaId } });
  if (!igreja || igreja.redeId !== redeId) {
    return { errors: { igrejaId: ["Selecione uma IC válida."] } };
  }

  const novoMembro = await prisma.user.update({
    where: { id: session.userId },
    data: { igrejaId, onboardingCompleto: true },
    select: { name: true },
  });

  if (igreja.liderId) {
    await sendPushToUsers([igreja.liderId], {
      title: "Novo membro na sua IC",
      body: `${novoMembro.name} entrou em ${igreja.nome}.`,
      url: `/redes/${igreja.redeId}/igrejas/${igreja.id}`,
    });
  }

  redirect("/inicio");
}

export async function completarOnboardingLider(
  state: OnboardingLiderFormState,
  formData: FormData
) {
  const session = await verifySession();

  const validatedFields = OnboardingLiderFormSchema.safeParse({
    liderDeRede: formData.get("liderDeRede"),
    redeId: formData.get("redeId"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { liderDeRede, redeId } = validatedFields.data;

  const rede = await prisma.rede.findUnique({ where: { id: redeId } });
  if (!rede) {
    return { errors: { redeId: ["Selecione uma rede válida."] } };
  }

  if (liderDeRede === "sim") {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.userId },
      select: { name: true },
    });

    const result = await prisma.rede.updateMany({
      where: { id: redeId, liderNome: null },
      data: { liderNome: user.name },
    });

    if (result.count === 0) {
      return { errors: { redeId: ["Essa rede já tem um líder. Escolha outra."] } };
    }
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { redeId, onboardingCompleto: true },
  });

  redirect("/inicio");
}

export async function pularOnboarding() {
  const session = await verifySession();
  await prisma.user.update({
    where: { id: session.userId },
    data: { onboardingCompleto: true },
  });
  redirect("/inicio");
}
