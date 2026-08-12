import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { MailIcon, PhoneIcon, MapPinIcon, CalendarIcon, ChurchIcon } from "@/components/icons";
import { CopyableField } from "@/components/copyable-field";
import { EditPerfilHeader } from "@/components/edit-perfil-form";
import { redeNomeSemPrefixo } from "@/lib/igrejas";

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
      rede: { select: { nome: true } },
      igreja: { select: { nome: true, rede: { select: { nome: true } } } },
    },
  });

  const redeNomeBruto = user.role === "PASTOR" ? "Rede Impulse" : (user.igreja?.rede.nome ?? user.rede?.nome ?? null);
  const redeNome = redeNomeBruto ? redeNomeSemPrefixo(redeNomeBruto) : null;
  const icNome = user.igreja?.nome ?? null;

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
      />

      <div className="flex w-full min-w-0 flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[.05] backdrop-blur-xl">
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
    </div>
  );
}
