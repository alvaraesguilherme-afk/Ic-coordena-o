import { notFound } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";
import { PresencaToggle } from "@/components/presenca-toggle";

export default async function ReuniaoDetailPage({ params }: PageProps<"/reunioes/[id]">) {
  const { id } = await params;
  const currentUser = await getUser();

  const reuniao = await prisma.reuniao.findUnique({
    where: { id },
    include: {
      presencas: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { user: { name: "asc" } },
      },
    },
  });

  if (!reuniao) {
    notFound();
  }

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
        {reuniao.presencas.map((presenca) => (
          <li key={presenca.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{presenca.user.name}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{presenca.user.email}</p>
            </div>
            {currentUser.role === "LIDER" ? (
              <PresencaToggle reuniaoId={reuniao.id} userId={presenca.user.id} presente={presenca.presente} />
            ) : (
              <span className="text-sm">{presenca.presente ? "Presente" : "Ausente"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
