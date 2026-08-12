import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EventoForm } from "@/components/evento-form";
import { BackLink } from "@/components/back-link";
import { redeNomeSemPrefixo } from "@/lib/igrejas";

export default async function NovoEventoPage({ params }: PageProps<"/redes/[id]/eventos/novo">) {
  const { id } = await params;

  const [currentUser, rede] = await Promise.all([
    getUser(),
    prisma.rede.findUnique({ where: { id } }),
  ]);

  if (!rede) {
    notFound();
  }

  const podeGerenciar =
    currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === rede.id);

  if (!podeGerenciar) {
    redirect(`/redes/${rede.id}/eventos`);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href={`/redes/${rede.id}/eventos`} label="Voltar" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Novo evento · {redeNomeSemPrefixo(rede.nome)}
      </h1>
      <EventoForm redeId={rede.id} />
    </div>
  );
}
