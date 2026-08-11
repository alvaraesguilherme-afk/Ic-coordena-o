import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";
import { PresencaToggle } from "@/components/presenca-toggle";

export default async function ReuniaoDetailPage({ params }: PageProps<"/reunioes/[id]">) {
  const { id } = await params;

  const [currentUser, reuniao, presencas, membros] = await Promise.all([
    getUser(),
    prisma.reuniao.findUnique({ where: { id } }),
    prisma.presenca.findMany({ where: { reuniaoId: id } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true } }),
  ]);

  if (!reuniao) {
    notFound();
  }

  const membroPorId = new Map(membros.map((m) => [m.id, m]));
  const presencasOrdenadas = [...presencas].sort((a, b) =>
    (membroPorId.get(a.userId)?.name ?? "").localeCompare(membroPorId.get(b.userId)?.name ?? "")
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <AppNav active="reunioes" userName={currentUser.name} userRole={currentUser.role} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{reuniao.titulo}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
            reuniao.data
          )}
        </p>
        {reuniao.descricao && <p className="mt-2 text-sm">{reuniao.descricao}</p>}
      </div>

      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/15">
        {presencasOrdenadas.map((presenca) => {
          const membro = membroPorId.get(presenca.userId);
          if (!membro) return null;
          return (
            <li key={presenca.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{membro.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{membro.email}</p>
              </div>
              {currentUser.role === "LIDER" ? (
                <PresencaToggle reuniaoId={reuniao.id} userId={membro.id} presente={presenca.presente} />
              ) : (
                <span className="text-sm">{presenca.presente ? "Presente" : "Ausente"}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
