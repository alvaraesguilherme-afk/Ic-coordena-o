import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Rota de redirecionamento puro (login → aqui → /inicio ou /onboarding), nunca
// renderiza UI própria nem faz parte da navegação entre abas.
export const instant = false;

export default async function Home() {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { onboardingCompleto: true },
  });

  redirect(user?.onboardingCompleto ? "/inicio" : "/onboarding");
}
