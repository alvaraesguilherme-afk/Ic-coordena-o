import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { IgrejaForm } from "@/components/igreja-form";
import { BackLink } from "@/components/back-link";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { nomesIguais } from "@/lib/user";

export default async function NovaIgrejaPage({ params }: PageProps<"/redes/[id]/igrejas/nova">) {
  const { id } = await params;
  const currentUser = await getUser();
  const podeCriar = currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === id);
  if (!podeCriar) {
    redirect(`/redes/${id}`);
  }

  const [rede, lideresDaRede, icsDaRede] = await Promise.all([
    prisma.rede.findUnique({ where: { id } }),
    prisma.user.findMany({
      where: { role: "LIDER", redeId: id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.igrejaCasa.findMany({ where: { redeId: id }, select: { liderId: true } }),
  ]);

  if (!rede) {
    notFound();
  }

  const liderIdsOcupados = new Set(icsDaRede.map((i) => i.liderId).filter((v): v is string => v !== null));
  const lideresDisponiveis = lideresDaRede.filter(
    (lider) => nomesIguais(lider.name, rede.liderNome) || !liderIdsOcupados.has(lider.id)
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href={`/redes/${id}`} label="Voltar" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">Nova IC em {redeNomeSemPrefixo(rede.nome)}</h1>
      <IgrejaForm redeId={rede.id} lideresDisponiveis={lideresDisponiveis} />
    </div>
  );
}
