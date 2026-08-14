import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { PersonIcon } from "@/components/icons";
import { MotivoFaltaInput } from "@/components/motivo-falta-input";
import { resolverEscopoFaltas } from "@/lib/faltas";

function formatDataFalta(data: Date) {
  const label = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  }).format(data);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export default async function FaltasPage() {
  const currentUser = await getUser();
  const escopo = await resolverEscopoFaltas(currentUser);
  if (!escopo) {
    redirect("/inicio");
  }

  const faltas = await prisma.presenca.findMany({
    where: { presente: false, ...escopo.where },
    select: {
      id: true,
      motivo: true,
      user: { select: { id: true, name: true, avatarUrl: true } },
      reuniao: {
        select: {
          data: true,
          igreja: { select: { id: true, nome: true, rede: { select: { nome: true } } } },
        },
      },
    },
    orderBy: { reuniao: { data: "desc" } },
  });

  const grupos = new Map<
    string,
    { igrejaNome: string; redeNome: string; data: Date; itens: typeof faltas }
  >();
  for (const falta of faltas) {
    const chave = `${falta.reuniao.igreja.id}_${falta.reuniao.data.toISOString()}`;
    const grupo = grupos.get(chave);
    if (grupo) {
      grupo.itens.push(falta);
    } else {
      grupos.set(chave, {
        igrejaNome: falta.reuniao.igreja.nome,
        redeNome: falta.reuniao.igreja.rede.nome,
        data: falta.reuniao.data,
        itens: [falta],
      });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Faltas</h1>

      {grupos.size === 0 ? (
        <p className="text-sm text-white/50">Nenhuma falta registrada ainda.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...grupos.values()].map((grupo) => (
            <div
              key={`${grupo.igrejaNome}_${grupo.data.toISOString()}`}
              className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30"
            >
              <h2 className="mb-3 text-sm font-semibold text-white">
                {grupo.igrejaNome}
                <span className="ml-2 font-normal text-white/40">
                  {grupo.redeNome} · {formatDataFalta(grupo.data)}
                </span>
              </h2>

              <ul className="flex flex-col gap-3">
                {grupo.itens.map((falta) => (
                  <li key={falta.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
                      {falta.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={falta.user.avatarUrl}
                          alt={falta.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PersonIcon className="h-4 w-4 text-white/40" />
                      )}
                    </div>
                    <p className="w-32 shrink-0 truncate text-sm text-white">{falta.user.name}</p>
                    <div className="flex-1">
                      <MotivoFaltaInput presencaId={falta.id} motivoInicial={falta.motivo} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
