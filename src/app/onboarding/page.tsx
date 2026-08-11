import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/auth-shell";
import { OnboardingMembroForm } from "@/components/onboarding-membro-form";
import { OnboardingLiderForm } from "@/components/onboarding-lider-form";

export default async function OnboardingPage() {
  const session = await verifySession();

  if (session.role === "MEMBRO") {
    const [redes, igrejas] = await Promise.all([
      prisma.rede.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
      prisma.igrejaCasa.findMany({
        orderBy: { nome: "asc" },
        select: { id: true, nome: true, liderNome: true, redeId: true },
      }),
    ]);

    return (
      <AuthShell>
        <h1 className="mb-1 text-center font-brand text-sm font-extrabold uppercase tracking-[0.2em] text-white">
          Qual é a sua IC?
        </h1>
        <p className="mb-8 text-center text-xs font-medium text-white/70">
          Escolha a rede e a IC (Igreja na Casa) a que você pertence.
        </p>
        <OnboardingMembroForm redes={redes} igrejas={igrejas} />
      </AuthShell>
    );
  }

  const redesDisponiveis = await prisma.rede.findMany({
    where: { liderNome: null },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <AuthShell>
      <h1 className="mb-1 text-center font-brand text-sm font-extrabold uppercase tracking-[0.2em] text-white">
        Liderança
      </h1>
      <p className="mb-8 text-center text-xs font-medium text-white/70">
        Você vai poder criar sua IC dentro de uma rede depois de entrar.
      </p>
      <OnboardingLiderForm redes={redesDisponiveis} />
    </AuthShell>
  );
}
