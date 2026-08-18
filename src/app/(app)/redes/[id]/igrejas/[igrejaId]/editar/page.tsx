import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { IgrejaForm } from "@/components/igreja-form";
import { TransferirMembroRow } from "@/components/transferir-membro-row";
import { BackLink } from "@/components/back-link";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { nomesIguais } from "@/lib/user";

export default async function EditarIgrejaPage({
  params,
}: PageProps<"/redes/[id]/igrejas/[igrejaId]/editar">) {
  const { id, igrejaId } = await params;
  const currentUser = await getUser();

  const [rede, igreja, lideresDaRede, icsDaRede, membros] = await Promise.all([
    prisma.rede.findUnique({ where: { id } }),
    prisma.igrejaCasa.findUnique({ where: { id: igrejaId } }),
    prisma.user.findMany({
      where: { role: "LIDER", redeId: id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.igrejaCasa.findMany({ where: { redeId: id }, select: { id: true, nome: true, liderId: true } }),
    prisma.user.findMany({
      where: { igrejaId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, avatarUrl: true },
    }),
  ]);

  if (!rede || !igreja || igreja.redeId !== id) {
    notFound();
  }

  const podeGerenciar = currentUser.isAdmin || currentUser.redeId === igreja.redeId;
  if (!podeGerenciar) {
    redirect(`/redes/${id}/igrejas/${igrejaId}`);
  }

  const icsDaRedeOutras = icsDaRede.filter((i) => i.id !== igrejaId);
  const liderIdsOcupados = new Set(
    icsDaRedeOutras.map((i) => i.liderId).filter((v): v is string => v !== null)
  );
  const lideresDisponiveis = lideresDaRede.filter(
    (lider) => nomesIguais(lider.name, rede.liderNome) || !liderIdsOcupados.has(lider.id)
  );

  const outrasIcs = icsDaRedeOutras.map((i) => ({ id: i.id, nome: i.nome }));
  // O líder da IC não entra na lista de transferência — pra trocar quem lidera,
  // usa o campo "Líder responsável" acima, que já cuida de mover o igrejaId dele.
  const membrosTransferiveis = membros.filter((m) => m.id !== igreja.liderId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href={`/redes/${id}/igrejas/${igrejaId}`} label="Voltar" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Editar {igreja.nome} — {redeNomeSemPrefixo(rede.nome)}
      </h1>

      <IgrejaForm
        redeId={rede.id}
        lideresDisponiveis={lideresDisponiveis}
        igreja={{
          id: igreja.id,
          nome: igreja.nome,
          liderId: igreja.liderId,
          diaSemana: igreja.diaSemana,
          horario: igreja.horario,
          endereco: igreja.endereco,
        }}
      />

      {outrasIcs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Transferir membro para outra IC
          </h2>

          {membrosTransferiveis.length === 0 ? (
            <p className="text-sm text-white/50">Nenhum membro pra transferir nesta IC ainda.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
              {membrosTransferiveis.map((membro) => (
                <TransferirMembroRow key={membro.id} membro={membro} outrasIcs={outrasIcs} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
