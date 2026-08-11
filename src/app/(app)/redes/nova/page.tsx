import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { RedeForm } from "@/components/rede-form";
import { BackLink } from "@/components/back-link";

export default async function NovaRedePage() {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    redirect("/redes");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/inicio" label="Voltar" />
      <h1 className="text-2xl font-semibold tracking-tight text-white">Nova rede</h1>
      <RedeForm />
    </div>
  );
}
