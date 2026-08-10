import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell>
      <h1 className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
        Impulse
      </h1>
      <LoginForm />
      <p className="mt-7 text-center text-xs text-white/60">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-cyan-300 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthShell>
  );
}
