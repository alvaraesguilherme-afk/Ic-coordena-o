import Link from "next/link";
import Image from "next/image";
import { BackLink } from "@/components/back-link";
import {
  CATEGORIAS_LINK,
  CATEGORIA_LINK_LABEL,
  SLUG_POR_CATEGORIA_LINK,
  type CategoriaLink,
} from "@/lib/links";

const CAPA_POR_CATEGORIA: Partial<Record<CategoriaLink, string>> = {
  DRIVES_ESCOLA_IMPULSE: "/brand/escola-impulse-2026.jpg",
  MINISTRACOES: "/brand/ministracoes-2.jpg",
  EVENTOS: "/brand/eventos.jpg",
};

export default function LinksPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/novidades" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Links úteis</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIAS_LINK.map((categoria) => {
          const capa = CAPA_POR_CATEGORIA[categoria];
          return (
            <Link
              key={categoria}
              href={`/links/${SLUG_POR_CATEGORIA_LINK[categoria]}`}
              className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-white/15 p-4 shadow-lg shadow-black/30 transition-colors hover:border-yellow-400/40"
            >
              {capa ? (
                <>
                  <Image src={capa} alt="" fill className="object-cover" />
                  <div className="absolute inset-0 bg-[#0c1445]/50" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-white/[.09] to-white/[.02]" />
              )}

              <p className="relative z-10 font-medium text-white">{CATEGORIA_LINK_LABEL[categoria]}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
