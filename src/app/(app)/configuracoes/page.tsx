import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { logout } from "@/app/actions/auth";
import { NotificacoesToggle } from "@/components/notificacoes-toggle";
import { SolicitarServoButton } from "@/components/solicitar-servo-button";
import { RecarregarButton } from "@/components/recarregar-button";
import { BellIcon, LogoutIcon, CameraIcon } from "@/components/icons";

export default async function ConfiguracoesPage() {
  const currentUser = await getUser();
  const userPrefs = await prisma.user.findUniqueOrThrow({
    where: { id: currentUser.id },
    select: { notificacoes: true, servoMidiaStatus: true, areasMidia: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Configurações</h1>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
            <BellIcon className="h-5 w-5 text-yellow-100" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Notificações</p>
            <p className="text-sm text-white/50">Receber avisos e novidades do Impulse</p>
          </div>
          <NotificacoesToggle ativo={userPrefs.notificacoes} />
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
            <CameraIcon className="h-5 w-5 text-yellow-100" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Servo de Mídia</p>
            <p className="text-sm text-white/50">
              Participe das escalas de mídia (projeção, câmera, transmissão...)
            </p>
          </div>
          <SolicitarServoButton status={userPrefs.servoMidiaStatus} area={userPrefs.areasMidia[0]} />
        </div>

        <RecarregarButton />

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-5 text-left backdrop-blur-xl transition-colors hover:border-red-400/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
              <LogoutIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <div>
              <p className="font-medium text-white">Sair</p>
              <p className="text-sm text-white/50">Encerrar sua sessão neste dispositivo</p>
            </div>
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Sobre</h2>
        <div className="rounded-2xl border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl">
          <p className="font-medium text-white">Impulse</p>
          <p className="mt-1 text-sm text-white/50">
            Um app para nossa amada Rede Impulse. Espero que aproveite, feito com muito carinho.
          </p>

          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {CREDITOS.map((pessoa) => (
              <div key={pessoa.nome} className="flex items-center justify-between">
                <p className="text-sm text-white">{pessoa.nome}</p>
                <p className="text-xs text-white/50">{pessoa.papel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const CREDITOS = [
  { nome: "Guilherme Alvarães", papel: "Desenvolvedor" },
  { nome: "Joyce Camily", papel: "Design e visual" },
  { nome: "Sthefany Trautman", papel: "Design e visual" },
];
