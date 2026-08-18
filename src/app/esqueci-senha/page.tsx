import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { EsqueciSenhaForm } from "@/components/esqueci-senha-form";

export default function EsqueciSenhaPage() {
  return (
    <AuthShell>
      <EsqueciSenhaForm />
      <p className="mt-6 text-center font-brand text-sm font-medium text-white/80">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-extrabold text-yellow-300 hover:underline">
          Voltar pro login.
        </Link>
      </p>
    </AuthShell>
  );
}
