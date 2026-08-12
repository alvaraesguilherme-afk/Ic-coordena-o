import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { AREAS_MIDIA, AREA_MIDIA_LABEL, type AreaMidia } from "@/lib/areas-midia";
import { EscalaMidiaForm } from "@/components/escala-midia-form";

export default async function EditarEscalaMidiaPage(props: PageProps<"/escalas/midia/editar">) {
  const currentUser = await getUser();
  if (!currentUser.isAdmin && !currentUser.supervisorMidia) {
    redirect("/escalas/midia");
  }

  const { area: areaParam, data: dataParam, mes } = await props.searchParams;
  const area = areaParam as AreaMidia;
  if (!AREAS_MIDIA.includes(area) || typeof dataParam !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dataParam)) {
    redirect("/escalas/midia");
  }

  const data = new Date(`${dataParam}T00:00:00.000Z`);
  if (data.getUTCDay() !== 6) {
    redirect("/escalas/midia");
  }

  const [servos, existente] = await Promise.all([
    prisma.user.findMany({
      where: { servoMidiaStatus: "APROVADO" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, areasServoMidia: { select: { area: true, nivel: true } } },
    }),
    prisma.escalaMidiaEntrada.findUnique({
      where: { area_data: { area, data } },
      select: { id: true, escaladoId: true, treinandoId: true },
    }),
  ]);

  const dataFormatada = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(data);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 pt-2">
      <BackLink href={`/escalas/midia${mes ? `?mes=${mes}` : ""}`} label="Voltar" />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{AREA_MIDIA_LABEL[area]}</h1>
        <p className="text-sm text-white/50">{dataFormatada}</p>
      </div>
      <EscalaMidiaForm
        area={area}
        data={dataParam}
        mes={typeof mes === "string" ? mes : undefined}
        servos={servos}
        entradaId={existente?.id}
        escaladoIdAtual={existente?.escaladoId}
        treinandoIdAtual={existente?.treinandoId ?? undefined}
      />
    </div>
  );
}
