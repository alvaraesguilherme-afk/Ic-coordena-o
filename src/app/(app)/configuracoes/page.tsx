import Link from "next/link";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NotificacoesToggle } from "@/components/notificacoes-toggle";
import { SolicitarServoButton } from "@/components/solicitar-servo-button";
import { RecarregarButton } from "@/components/recarregar-button";
import { LogoutButton } from "@/components/logout-button";
import { DeleteAccountButton } from "@/components/delete-account-button";
import { BellIcon, CameraIcon, ChurchIcon, PersonIcon } from "@/components/icons";
import { nomeReduzido } from "@/lib/user";
import { version as APP_VERSION } from "../../../../package.json";

export default async function ConfiguracoesPage() {
  const currentUser = await getUser();
  const [userPrefs, usuariosCreditos] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: currentUser.id },
      select: {
        notificacoes: true,
        servoMidiaStatus: true,
        areaSolicitadaMidia: true,
        servoMidiaRecusadoEm: true,
        areasServoMidia: { select: { area: true } },
      },
    }),
    prisma.user.findMany({
      where: { id: { in: CREDITOS.map((c) => c.userId) } },
      select: { id: true, name: true, avatarUrl: true },
    }),
  ]);
  const usuarioCreditoPorId = new Map(usuariosCreditos.map((u) => [u.id, u]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-white">Configurações</h1>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
            <BellIcon className="h-5 w-5 text-yellow-100" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Notificações</p>
            <p className="text-sm text-white/50">Receber avisos e novidades do Impulse</p>
          </div>
          <NotificacoesToggle ativo={userPrefs.notificacoes} />
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
            <CameraIcon className="h-5 w-5 text-yellow-100" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Servo de Mídia</p>
            <p className="text-sm text-white/50">
              Participe das escalas de mídia (projeção, câmera, transmissão...)
            </p>
          </div>
          <SolicitarServoButton
            status={userPrefs.servoMidiaStatus}
            areas={
              userPrefs.servoMidiaStatus === "APROVADO"
                ? userPrefs.areasServoMidia.map((a) => a.area)
                : userPrefs.areaSolicitadaMidia
                  ? [userPrefs.areaSolicitadaMidia]
                  : []
            }
            recusadoEm={userPrefs.servoMidiaRecusadoEm}
          />
        </div>

        <RecarregarButton />
      </div>

      {currentUser.isAdmin && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Admin</h2>
          <Link
            href="/frequencia"
            className="flex items-center gap-4 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl transition-colors hover:border-yellow-400/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/30 to-yellow-400/30">
              <ChurchIcon className="h-5 w-5 text-yellow-100" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Frequência das ICs</p>
              <p className="text-sm text-white/50">Presença e faltas de todas as ICs, num lugar só</p>
            </div>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Sobre</h2>
        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-5 shadow-lg shadow-black/30 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">Impulse</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
              v{APP_VERSION}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Um app para nossa amada Rede Impulse. Espero que aproveite, feito com muito carinho.
          </p>

          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
            {CREDITOS.map((credito) => {
              const usuario = usuarioCreditoPorId.get(credito.userId);
              if (!usuario) return null;
              return (
                <div key={credito.userId} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
                      {usuario.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={usuario.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <PersonIcon className="h-full w-full p-1.5 text-white/40" />
                      )}
                    </div>
                    <p className="truncate text-sm text-white">{nomeReduzido(usuario.name)}</p>
                  </div>
                  <p className="shrink-0 text-xs text-white/50">{credito.papel}</p>
                </div>
              );
            })}
          </div>

          <p className="mt-4 border-t border-white/10 pt-4 text-xs text-white/40">
            LGPD implementada no app em 14 de agosto de 2026.{" "}
            <Link href="/termos" className="text-yellow-300 hover:underline">
              Ver Termos e Privacidade
            </Link>
          </p>
        </div>
      </div>

      <LogoutButton />
      <DeleteAccountButton />
    </div>
  );
}

// userId em vez de nome fixo — assim o crédito reflete a conta real (nome
// atual + foto de perfil) em vez de um texto solto que pode ficar desatualizado.
const CREDITOS = [
  { userId: "cmsnmvllz0000lkufkuokogdd", papel: "Desenvolvedor" }, // Guilherme Alvarães
  { userId: "cmsooataf000004l4hq44hoyw", papel: "Identidade visual" }, // Joyce Camilly
  { userId: "cmsoqy35r000004jujlb4eiln", papel: "Identidade visual" }, // Sthefany Trautmann
  { userId: "cmstfobzv000104kyt6qcd81m", papel: "Identidade visual" }, // Eduardo
];
