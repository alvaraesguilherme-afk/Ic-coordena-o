import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";

export default function CadastroPage() {
  return (
    <AuthShell>
      <h1 className="mb-1 text-center font-brand text-sm font-extrabold uppercase tracking-[0.2em] text-white">
        Criar conta
      </h1>
      <p className="mb-8 text-center text-xs font-medium text-white/70">
        Cadastre-se no Impulse como líder ou membro.
      </p>
      <SignupForm />
      <p className="mt-7 text-center font-brand text-sm font-medium text-white/80">
        Já tem conta?{" "}
        <Link href="/login" className="font-extrabold text-yellow-300 hover:underline">
          Entrar.
        </Link>
      </p>
    </AuthShell>
  );
}
