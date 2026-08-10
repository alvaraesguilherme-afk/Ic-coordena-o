import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { ReuniaoForm } from "@/components/reuniao-form";

export default async function NovaReuniaoPage() {
  const session = await verifySession();
  if (session.role !== "LIDER") {
    redirect("/reunioes");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Nova reunião</h1>
      <ReuniaoForm />
    </div>
  );
}
