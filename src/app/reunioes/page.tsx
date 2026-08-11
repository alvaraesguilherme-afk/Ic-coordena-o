import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";

export default async function ReunioesPage() {
  const [currentUser, reunioes, presencas] = await Promise.all([
    getUser(),
    prisma.reuniao.findMany({ orderBy: { data: "desc" } }),
    prisma.presenca.findMany({ select: { reuniaoId: true, presente: true } }),
  ]);

  const contagemPorReuniao = new Map<string, { total: number; presentes: number }>();
  for (const presenca of presencas) {
    const atual = contagemPorReuniao.get(presenca.reuniaoId) ?? { total: 0, presentes: 0 };
    atual.total += 1;
    if (presenca.presente) atual.presentes += 1;
    contagemPorReuniao.set(presenca.reuniaoId, atual);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <AppNav active="reunioes" userName={currentUser.name} userRole={currentUser.role} />

      <h1 className="text-2xl font-semibold tracking-tight">Reuniões</h1>

      {currentUser.role === "LIDER" && (
        <Link
          href="/reunioes/nova"
          className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          + Nova reunião
        </Link>
      )}

      {reunioes.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Nenhuma reunião cadastrada ainda.</p>
      )}

      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/15">
        {reunioes.map((reuniao) => (
          <li key={reuniao.id}>
            <Link
              href={`/reunioes/${reuniao.id}`}
              className="flex items-center justify-between py-3 hover:bg-black/[.02] dark:hover:bg-white/[.03]"
            >
              <div>
                <p className="font-medium">{reuniao.titulo}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                    reuniao.data
                  )}
                </p>
              </div>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {contagemPorReuniao.get(reuniao.id)?.presentes ?? 0}/
                {contagemPorReuniao.get(reuniao.id)?.total ?? 0} presentes
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
