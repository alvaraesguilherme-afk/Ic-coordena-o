import Image from "next/image";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { ProgramacaoForm } from "@/components/programacao-form";
import { DeleteProgramacaoButton } from "@/components/delete-programacao-button";
import { CalendarIcon, MapPinIcon } from "@/components/icons";
import { podeGerenciarLinks } from "@/lib/links";

export default async function ProgramacaoPage() {
  const [currentUser, publicacoes] = await Promise.all([
    getUser(),
    prisma.programacao.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const podeGerenciar = podeGerenciarLinks(currentUser);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/novidades" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Programação</h1>

      {podeGerenciar && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <ProgramacaoForm />
        </div>
      )}

      {publicacoes.length === 0 && (
        <p className="text-sm text-white/50">Nenhuma programação publicada ainda.</p>
      )}

      <ul className="flex flex-col gap-4">
        {publicacoes.map((item) => {
          const corpo = (
            <>
              {item.capaUrl && (
                <div className="relative aspect-[16/9] w-full">
                  <Image src={item.capaUrl} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="flex flex-col px-5 py-4">
                {item.titulo && <p className="font-medium text-white">{item.titulo}</p>}
                <p className="mt-1 whitespace-pre-wrap text-sm text-white/70">{item.conteudo}</p>

                {(item.dataEvento || item.local) && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-white/10 pt-3">
                    {item.dataEvento && (
                      <p className="flex items-center gap-2 text-sm text-white/70">
                        <CalendarIcon className="h-4 w-4 shrink-0 text-yellow-300" />
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(item.dataEvento)}
                      </p>
                    )}
                    {item.local && (
                      <p className="flex items-center gap-2 text-sm text-white/70">
                        <MapPinIcon className="h-4 w-4 shrink-0 text-yellow-300" />
                        {item.local}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          );

          return (
            <li
              key={item.id}
              className="relative flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl"
            >
              {podeGerenciar && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                  <DeleteProgramacaoButton id={item.id} />
                </div>
              )}
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col transition-transform active:scale-[0.98]"
                >
                  {corpo}
                </a>
              ) : (
                corpo
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
