import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { MembroForm } from "@/components/membro-form";

export default async function NovoMembroPage() {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    redirect("/membros");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Novo membro</h1>
      <MembroForm />
    </div>
  );
}
