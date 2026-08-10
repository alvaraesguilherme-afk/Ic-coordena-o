import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SignupForm } from "@/components/signup-form";

export default function CadastroPage() {
  return (
    <AuthShell>
      <h1 className="mb-1 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
        Criar conta
      </h1>
      <p className="mb-8 text-center text-xs text-white/50">
        Cadastre-se no Impulse como líder ou membro.
      </p>
      <SignupForm />
      <p className="mt-7 text-center text-xs text-white/60">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-cyan-300 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
