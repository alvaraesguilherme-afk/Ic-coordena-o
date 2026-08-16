import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, ChurchIcon } from "@/components/icons";
import { CopyableField } from "@/components/copyable-field";
import { EditPerfilHeader } from "@/components/edit-perfil-form";
import { redeNomeSemPrefixo } from "@/lib/igrejas";
import { nomesIguais } from "@/lib/user";
import { FUNCAO_MIDIA_LABEL } from "@/lib/funcoes-midia";

export default async function PerfilPage() {
  const session = await verifySession();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
      birthDate: true,
      avatarUrl: true,
      role: true,
      isAdmin: true,
      rede: { select: { nome: true, liderNome: true } },
      igreja: { select: { nome: true, rede: { select: { nome: true } } } },
      servoMidiaStatus: true,
      supervisorMidia: true,
      areasServoMidia: { select: { area: true, nivel: true } },
    },
  });

  const serveNaMidia = user.servoMidiaStatus === "APROVADO" && user.areasServoMidia.length > 0;

  const redeNomeBruto = user.role === "PASTOR" ? "Rede Impulse" : (user.igreja?.rede.nome ?? user.rede?.nome ?? null);
  const redeNome = redeNomeBruto ? redeNomeSemPrefixo(redeNomeBruto) : null;
  const icNome = user.igreja?.nome ?? null;
  const liderDeRede = user.role === "LIDER" && nomesIguais(user.rede?.liderNome, user.name);

  const rows = [
    { Icon: MailIcon, label: "E-mail", value: user.email },
    { Icon: ChurchIcon, label: "Rede", value: redeNome },
    { Icon: ChurchIcon, label: "IC", value: icNome },
    { Icon: PhoneIcon, label: "Telefone", value: user.phone, copyable: true },
    { Icon: MapPinIcon, label: "Endereço", value: user.address, copyable: true },
    {
      Icon: CalendarIcon,
      label: "Data de nascimento",
      value: user.birthDate
        ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(
            user.birthDate
          )
        : null,
    },
  ];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-1 flex-col items-center gap-6 pt-2">
      <EditPerfilHeader
        name={user.name}
        avatarUrl={user.avatarUrl}
        role={user.role}
        isAdmin={user.isAdmin}
        liderDeRede={liderDeRede}
      />

      <div className="flex w-full min-w-0 flex-col divide-y divide-white/10 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] shadow-lg shadow-black/30 backdrop-blur-xl">
        {rows.map(
          ({ Icon, label, value, copyable }) =>
            value && (
              <CopyableField
                key={label}
                icon={<Icon className="h-5 w-5" />}
                label={label}
                value={value}
                copyable={copyable}
              />
            )
        )}
      </div>

      {serveNaMidia && (
        <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Área que serve</h2>
          <ul className="flex flex-col divide-y divide-white/10">
            {user.areasServoMidia.map(({ area, nivel }) => (
              <li key={area} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm text-white">Mídia · {FUNCAO_MIDIA_LABEL[area]}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.supervisorMidia
                      ? "bg-yellow-400/15 text-yellow-300"
                      : nivel === "VETERANO"
                        ? "bg-white/10 text-white/80"
                        : "bg-white/10 text-white/50"
                  }`}
                >
                  {user.supervisorMidia ? "Supervisor" : nivel === "VETERANO" ? "Veterano" : "Em treinamento"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
