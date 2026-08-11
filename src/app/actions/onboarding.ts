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

  await prisma.user.update({
    where: { id: session.userId },
    data: { igrejaId },
  });

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

  redirect("/inicio");
}

export async function pularOnboarding() {
  await verifySession();
  redirect("/inicio");
}
