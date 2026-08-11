import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AvisoForm } from "@/components/aviso-form";
import { DeleteAvisoButton } from "@/components/delete-aviso-button";

export default async function AvisosPage() {
  const [currentUser, avisos, membros] = await Promise.all([
    getUser(),
    prisma.aviso.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const nomePorUserId = new Map(membros.map((m) => [m.id, m.name]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Avisos</h1>

      {currentUser.role === "LIDER" && (
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl">
          <AvisoForm />
        </div>
      )}

      {avisos.length === 0 && <p className="text-sm text-white/50">Nenhum aviso publicado ainda.</p>}

      <ul className="flex flex-col gap-4">
        {avisos.map((aviso) => (
          <li
            key={aviso.id}
            className="rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{aviso.titulo}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{aviso.conteudo}</p>
                <p className="mt-2 text-xs text-white/40">
                  {nomePorUserId.get(aviso.autorId) ?? ""} ·{" "}
                  {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
                    aviso.createdAt
                  )}
                </p>
              </div>
              {currentUser.role === "LIDER" && <DeleteAvisoButton id={aviso.id} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
