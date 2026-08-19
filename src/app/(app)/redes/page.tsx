import Link from "next/link";
import Image from "next/image";
import { getUser } from "@/lib/dal";
import { getRedesData } from "@/lib/data";
import { DeleteRedeButton } from "@/components/delete-rede-button";
import { BackLink } from "@/components/back-link";
import { ChurchIcon } from "@/components/icons";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { CAPA_POR_REDE } from "@/lib/redes-capas";

export default async function RedesPage() {
  const [currentUser, { redes, igrejas }] = await Promise.all([getUser(), getRedesData()]);

  const contagemPorRede = new Map<string, number>();
  for (const igreja of igrejas) {
    contagemPorRede.set(igreja.redeId, (contagemPorRede.get(igreja.redeId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Redes</h1>
        {currentUser.role === "LIDER" && (
          <Link
            href="/redes/nova"
            className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445]"
          >
            + Nova rede
          </Link>
        )}
      </div>

      {redes.length === 0 && <p className="text-sm text-white/50">Nenhuma rede cadastrada ainda.</p>}

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
        {redes.map((rede) => {
          const capa = CAPA_POR_REDE[redeNomeSemPrefixo(rede.nome)];
          return (
            <div key={rede.id} className="flex flex-col items-center gap-2 text-center">
              <Link
                href={`/redes/${rede.id}`}
                className="relative aspect-square w-full overflow-hidden rounded-full border border-white/15 shadow-lg shadow-black/30 transition hover:border-yellow-400/40 active:scale-95"
              >
                {capa ? (
                  <Image src={capa} alt={redeNomeSemPrefixo(rede.nome)} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[.09] to-white/[.02]">
                    <ChurchIcon className="h-6 w-6 text-yellow-100" />
                  </div>
                )}
              </Link>
              <div>
                <p className="font-medium text-white">{redeNomeSemPrefixo(rede.nome)}</p>
                {rede.liderNome && <p className="text-xs text-white/50">Líder: {rede.liderNome}</p>}
                <p className="mt-1 text-xs text-white/40">
                  {contagemPorRede.get(rede.id) ?? 0} IC(s)
                </p>
              </div>
              {currentUser.role === "LIDER" && <DeleteRedeButton id={rede.id} nome={rede.nome} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
