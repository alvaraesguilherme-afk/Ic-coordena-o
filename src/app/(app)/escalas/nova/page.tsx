import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EscalaForm } from "@/components/escala-form";
import { BackLink } from "@/components/back-link";
import { TIPOS_ESCALA, type TipoEscala } from "@/lib/escalas";

export default async function NovaEscalaPage(props: PageProps<"/escalas/nova">) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    redirect("/escalas");
  }

  const { tipo } = await props.searchParams;
  const defaultTipo = TIPOS_ESCALA.includes(tipo as TipoEscala) ? (tipo as TipoEscala) : undefined;

  const [membros, servos] = await Promise.all([
    prisma.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { servoMidiaStatus: "APROVADO" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">Nova escala</h1>
      <EscalaForm membros={membros} servos={servos} defaultTipo={defaultTipo} />
    </div>
  );
}
