import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AvisoForm } from "@/components/aviso-form";
import { DeleteAvisoButton } from "@/components/delete-aviso-button";
import { CalendarIcon, MapPinIcon, LinkIcon } from "@/components/icons";

export default async function NovidadesPage() {
  const [currentUser, avisos, membros] = await Promise.all([
    getUser(),
    prisma.aviso.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { id: true, name: true } }),
  ]);

  const nomePorUserId = new Map(membros.map((m) => [m.id, m.name]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Mural</h1>

      <Link
        href="/links"
        className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/30 to-red-500/30">
          <LinkIcon className="h-5 w-5 text-yellow-100" />
        </div>
        <div>
          <p className="font-medium text-white">Links úteis</p>
          <p className="mt-1 text-sm text-white/50">Drives, vídeos, inscrições e mais</p>
        </div>
      </Link>

      {currentUser.role === "LIDER" && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <AvisoForm />
        </div>
      )}

      {avisos.length === 0 && <p className="text-sm text-white/50">Nada publicado ainda.</p>}

      <ul className="flex flex-col gap-4">
        {avisos.map((aviso) => (
          <li
            key={aviso.id}
            className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {aviso.dataEvento && (
                  <span className="mb-2 inline-block rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-300">
                    Evento
                  </span>
                )}
                <p className="font-medium text-white">{aviso.titulo}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{aviso.conteudo}</p>

                {(aviso.dataEvento || aviso.local) && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3">
                    {aviso.dataEvento && (
                      <p className="flex items-center gap-2 text-sm text-white/70">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-yellow-300" />
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(aviso.dataEvento)}
                      </p>
                    )}
                    {aviso.local && (
                      <p className="flex items-center gap-2 text-sm text-white/70">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-yellow-300" />
                        {aviso.local}
                      </p>
                    )}
                  </div>
                )}

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
