import Link from "next/link";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { DeleteIgrejaButton } from "@/components/delete-igreja-button";
import { DeleteMembroButton } from "@/components/delete-membro-button";
import { BackLink } from "@/components/back-link";
import { ChurchIcon, PersonIcon, CalendarIcon, MapPinIcon } from "@/components/icons";
import { formatEncontroIC } from "@/lib/igrejas";
import { roleLabel, nomesIguais } from "@/lib/user";

export default async function IgrejaDetailPage({
  params,
}: PageProps<"/redes/[id]/igrejas/[igrejaId]">) {
  const { id, igrejaId } = await params;

  const [currentUser, igreja, membros, rede] = await Promise.all([
    getUser(),
    prisma.igrejaCasa.findUnique({
      where: { id: igrejaId },
      include: { lider: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { igrejaId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, avatarUrl: true, role: true, isAdmin: true },
    }),
    prisma.rede.findUnique({ where: { id }, select: { liderNome: true } }),
  ]);

  if (!igreja || igreja.redeId !== id) {
    notFound();
  }

  const podeGerenciar = currentUser.isAdmin || currentUser.redeId === igreja.redeId;
  const podeVerFrequencia = currentUser.isAdmin || currentUser.id === igreja.liderId;

  const rows = [
    { Icon: PersonIcon, label: "Líder", value: igreja.lider?.name ?? null },
    { Icon: CalendarIcon, label: "Encontros", value: formatEncontroIC(igreja.diaSemana, igreja.horario) },
    { Icon: MapPinIcon, label: "Endereço", value: igreja.endereco },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 pt-2">
      <BackLink href={`/redes/${id}`} label="Voltar" className="self-start" />

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
        <ChurchIcon className="h-8 w-8 text-yellow-100" />
      </div>

      <h1 className="text-center text-2xl font-semibold tracking-tight text-white">{igreja.nome}</h1>

      <div className="flex w-full flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
        {rows.map(
          ({ Icon, label, value }) =>
            value && (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <Icon className="h-5 w-5 shrink-0 text-yellow-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="break-words text-sm text-white">{value}</p>
                </div>
              </div>
            )
        )}
      </div>

      {podeVerFrequencia && (
        <Link
          href={`/redes/${id}/igrejas/${igrejaId}/frequencia`}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
            <CalendarIcon className="h-5 w-5 text-yellow-100" />
          </div>
          <p className="text-sm font-medium text-white">Lista de Frequência</p>
        </Link>
      )}

      <div className="flex w-full flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
          Membros ({membros.length})
        </h2>

        {membros.length === 0 ? (
          <p className="text-sm text-white/50">Nenhum membro cadastrado nesta IC ainda.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
            {membros.map((membro) => (
              <li key={membro.id} className="flex items-center gap-3 px-5 py-3">
                <Link
                  href={
                    membro.id === currentUser.id ? "/perfil" : `/membros/${membro.id}`
                  }
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                    {membro.avatarUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={membro.avatarUrl}
                        alt={membro.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="truncate text-sm text-white">{membro.name}</p>
                  {(membro.role === "LIDER" || membro.isAdmin) && (
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
                      {roleLabel({
                        ...membro,
                        liderDeRede: membro.role === "LIDER" && nomesIguais(membro.name, rede?.liderNome),
                      })}
                    </span>
                  )}
                </Link>
                {podeGerenciar && membro.id !== currentUser.id && (
                  <DeleteMembroButton
                    id={membro.id}
                    nome={membro.name}
                    redeId={igreja.redeId}
                    igrejaId={igreja.id}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {podeGerenciar && (
        <DeleteIgrejaButton id={igreja.id} nome={igreja.nome} redeId={igreja.redeId} />
      )}
    </div>
  );
}
