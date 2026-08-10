import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-32">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Coordenação de IC</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Entre com sua conta para continuar.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
