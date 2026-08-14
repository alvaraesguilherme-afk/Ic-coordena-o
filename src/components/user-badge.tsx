import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/dal";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeiras = partes.length > 1 ? [partes[0], partes[partes.length - 1]] : [partes[0]];
  return primeiras.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export async function UserBadge() {
  const currentUser = await getUser();

  return (
    <Link
      href="/perfil"
      title="Perfil"
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-[2px] transition-transform hover:scale-105"
      style={{ background: "conic-gradient(from 180deg, #f5c518, #c62828, #f5c518)" }}
    >
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#0c1445] bg-[#0c1445]">
        {currentUser.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-white">{iniciais(currentUser.name)}</span>
        )}
      </span>
      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#0c1445] bg-[#0c1445] p-[3px] shadow-lg shadow-black/40">
        <Image src="/brand/lightning.png" alt="" width={16} height={16} className="h-full w-full object-contain" />
      </span>
    </Link>
  );
}
