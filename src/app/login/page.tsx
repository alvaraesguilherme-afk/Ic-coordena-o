import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
      <p className="mt-6 text-center font-brand text-sm font-medium text-white/80">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-extrabold text-yellow-300 hover:underline">
          Cadastre-se.
        </Link>
      </p>
    </AuthShell>
  );
}
