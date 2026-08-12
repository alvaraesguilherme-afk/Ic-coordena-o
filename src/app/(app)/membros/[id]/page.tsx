import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  PersonIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ChurchIcon,
} from "@/components/icons";
import { BackLink } from "@/components/back-link";
import { CopyableField } from "@/components/copyable-field";
import { roleLabel } from "@/lib/user";

export default async function MembroDetailPage({ params }: PageProps<"/membros/[id]">) {
  const { id } = await params;
  const currentUser = await getUser();

  if (id === currentUser.id) {
    redirect("/perfil");
  }

  const membro = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      birthDate: true,
      avatarUrl: true,
      role: true,
      isAdmin: true,
      redeId: true,
      rede: { select: { nome: true } },
      igreja: { select: { nome: true, redeId: true, rede: { select: { nome: true } } } },
    },
  });

  if (!membro) {
    notFound();
  }

  const redeNome =
    membro.role === "PASTOR" ? "Rede Impulse" : (membro.igreja?.rede.nome ?? membro.rede?.nome ?? null);
  const icNome = membro.igreja?.nome ?? null;
  const membroRedeId = membro.igreja?.redeId ?? membro.redeId;

  const podeVerTudo =
    currentUser.isAdmin || (currentUser.role === "LIDER" && currentUser.redeId === membroRedeId);

  const rows = podeVerTudo
    ? [
        { Icon: MailIcon, label: "E-mail", value: membro.email },
        { Icon: ChurchIcon, label: "Rede", value: redeNome },
        { Icon: ChurchIcon, label: "IC", value: icNome },
        { Icon: PhoneIcon, label: "Telefone", value: membro.phone, copyable: true },
        ...(currentUser.isAdmin
          ? [{ Icon: MapPinIcon, label: "Endereço", value: membro.address, copyable: true }]
          : []),
        {
          Icon: CalendarIcon,
          label: "Data de nascimento",
          value: membro.birthDate
            ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(
                membro.birthDate
              )
            : null,
        },
      ]
    : [
        { Icon: ChurchIcon, label: "Rede", value: redeNome },
        { Icon: ChurchIcon, label: "IC", value: icNome },
      ];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-1 flex-col items-center gap-6 pt-2">
      <BackLink href="/membros" label="Voltar" className="self-start" />

      <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-yellow-400/50 bg-white/10">
        {membro.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={membro.avatarUrl} alt={membro.name} className="h-full w-full object-cover" />
        ) : (
          <PersonIcon className="h-full w-full p-6 text-white/40" />
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{membro.name}</h1>
        <span className="mt-1 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
          {roleLabel(membro)}
        </span>
      </div>

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
