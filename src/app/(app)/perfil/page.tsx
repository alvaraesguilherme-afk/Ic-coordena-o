import { verifySession } from "@/lib/dal";
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
      rede: { select: { nome: true } },
      igreja: { select: { nome: true, rede: { select: { nome: true } } } },
    },
  });

  const redeNome = user.igreja?.rede.nome ?? user.rede?.nome ?? null;
  const icNome = user.igreja?.nome ?? null;

  const rows = [
    { Icon: MailIcon, label: "E-mail", value: user.email },
    { Icon: ChurchIcon, label: "Rede", value: redeNome },
    { Icon: ChurchIcon, label: "IC", value: icNome },
    { Icon: PhoneIcon, label: "Telefone", value: user.phone },
    { Icon: MapPinIcon, label: "Endereço", value: user.address },
    {
      Icon: CalendarIcon,
      label: "Data de nascimento",
      value: user.birthDate
        ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(user.birthDate)
        : null,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 pt-2">
      <BackLink href="/inicio" label="Início" className="self-start" />

      <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-yellow-400/50 bg-white/10">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <PersonIcon className="h-full w-full p-6 text-white/40" />
        )}
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{user.name}</h1>
        <span className="mt-1 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
          {user.role === "LIDER" ? "Líder" : "Membro"}
        </span>
      </div>

      <div className="flex w-full flex-col divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[.05] backdrop-blur-xl">
        {rows.map(
          ({ Icon, label, value }) =>
            value && (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <Icon className="h-5 w-5 shrink-0 text-yellow-300" />
                <div>
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
