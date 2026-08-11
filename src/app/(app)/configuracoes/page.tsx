import Link from "next/link";
import { getUser } from "@/lib/dal";
import { UsersIcon, CalendarIcon } from "@/components/icons";
import { BackLink } from "@/components/back-link";

export default async function ConfiguracoesPage() {
  const currentUser = await getUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Início" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">Configurações</h1>

      {currentUser.role === "LIDER" ? (
        <div className="flex flex-col gap-4">
          <Link
            href="/membros"
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl transition-colors hover:border-sky-400/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/30 to-orange-400/30">
              <UsersIcon className="h-5 w-5 text-sky-200" />
            </div>
            <div>
              <p className="font-medium text-white">Gerenciar membros</p>
              <p className="text-sm text-white/50">Adicionar ou remover membros da IC</p>
            </div>
          </Link>

          <Link
            href="/reunioes"
            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl transition-colors hover:border-orange-400/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400/30 to-sky-500/30">
              <CalendarIcon className="h-5 w-5 text-orange-200" />
            </div>
            <div>
              <p className="font-medium text-white">Gerenciar reuniões</p>
              <p className="text-sm text-white/50">Criar reuniões e registrar presença</p>
            </div>
          </Link>
        </div>
      ) : (
        <p className="text-sm text-white/50">Nenhuma configuração disponível por enquanto.</p>
      )}
    </div>
  );
}
