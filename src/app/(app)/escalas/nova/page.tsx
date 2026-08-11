import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EscalaForm } from "@/components/escala-form";
import { BackLink } from "@/components/back-link";
import { TIPOS_ESCALA_CRIAVEIS, type TipoEscala } from "@/lib/escalas";

export default async function NovaEscalaPage(props: PageProps<"/escalas/nova">) {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    redirect("/escalas");
  }

  const { tipo } = await props.searchParams;
  if (tipo === "MIDIA") {
    redirect("/escalas/midia");
  }
  const defaultTipo = (TIPOS_ESCALA_CRIAVEIS as readonly string[]).includes(tipo as string)
    ? (tipo as TipoEscala)
    : undefined;

  const membros = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">Nova escala</h1>
      <EscalaForm membros={membros} defaultTipo={defaultTipo} />
    </div>
  );
}
