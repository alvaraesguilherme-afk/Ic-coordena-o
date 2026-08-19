import { notFound } from "next/navigation";
import Image from "next/image";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { LinkForm } from "@/components/link-form";
import { DeleteLinkButton } from "@/components/delete-link-button";
import { BackLink } from "@/components/back-link";
import { LinkIcon } from "@/components/icons";
import { CATEGORIA_LINK_LABEL, CATEGORIA_LINK_POR_SLUG, podeGerenciarLinks } from "@/lib/links";
import { capaEstaticaDoLink } from "@/lib/links-capas";

export default async function LinksCategoriaPage({
  params,
}: PageProps<"/links/[categoria]">) {
  const { categoria: slug } = await params;
  const categoria = CATEGORIA_LINK_POR_SLUG[slug];
  if (!categoria) {
    notFound();
  }

  const [currentUser, links] = await Promise.all([
    getUser(),
    prisma.linkUtil.findMany({ where: { categoria }, orderBy: { createdAt: "desc" } }),
  ]);

  const podeGerenciar = podeGerenciarLinks(currentUser);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/novidades" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">
        {CATEGORIA_LINK_LABEL[categoria]}
      </h1>

      {podeGerenciar && (
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <LinkForm categoria={categoria} />
        </div>
      )}

      {links.length === 0 && <p className="text-sm text-white/50">Nenhum link adicionado ainda.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {links.map((link) => {
          const capa = capaEstaticaDoLink(link.titulo) ?? link.capaUrl;
          return capa ? (
            <div
              key={link.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform active:scale-[0.97]"
              >
                <div className="relative aspect-[16/10] w-full">
                  <Image src={capa} alt="" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <p className="absolute inset-x-0 bottom-0 truncate p-3 text-lg font-semibold text-white">
                    {link.titulo}
                  </p>
                </div>
              </a>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-sm text-yellow-200 hover:underline"
                >
                  {link.url}
                </a>
                {podeGerenciar && <DeleteLinkButton id={link.id} />}
              </div>
            </div>
          ) : (
            <div
              key={link.id}
              className="flex items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] px-5 py-4 shadow-lg shadow-black/30 backdrop-blur-xl"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-3 transition-transform active:scale-[0.97]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
                  <LinkIcon className="h-5 w-5 text-yellow-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{link.titulo}</p>
                  <p className="truncate text-sm text-white/40">{link.url}</p>
                </div>
              </a>
              {podeGerenciar && <DeleteLinkButton id={link.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
