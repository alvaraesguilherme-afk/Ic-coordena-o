import Link from "next/link";
import { getUser, verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AppNav } from "@/components/app-nav";
import { DeleteMembroButton } from "@/components/delete-membro-button";

export default async function MembrosPage() {
  const [session, currentUser, membros] = await Promise.all([
    verifySession(),
    getUser(),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <AppNav active="membros" userName={currentUser.name} userRole={currentUser.role} />

      <h1 className="text-2xl font-semibold tracking-tight">Membros da IC</h1>

      {session.role === "LIDER" && (
        <Link
          href="/membros/novo"
          className="w-fit rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          + Novo membro
        </Link>
      )}

      <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/15">
        {membros.map((membro) => (
          <li key={membro.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                {membro.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={membro.avatarUrl}
                    alt={membro.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{membro.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{membro.email}</p>
                {membro.phone && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{membro.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium dark:bg-white/10">
                {membro.role === "LIDER" ? "Líder" : "Membro"}
              </span>
              {session.role === "LIDER" && membro.id !== session.userId && (
                <DeleteMembroButton id={membro.id} name={membro.name} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
