import { notFound, redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { IgrejaForm } from "@/components/igreja-form";
import { BackLink } from "@/components/back-link";

export default async function NovaIgrejaPage({ params }: PageProps<"/redes/[id]/igrejas/nova">) {
  const { id } = await params;
  const session = await verifySession();
  if (session.role !== "LIDER") {
    redirect(`/redes/${id}`);
  }

  const rede = await prisma.rede.findUnique({ where: { id } });
  if (!rede) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Início" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">Nova IC em {rede.nome}</h1>
      <IgrejaForm redeId={rede.id} />
    </div>
  );
}
