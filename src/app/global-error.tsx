"use client";

// Cobre erros que acontecem no próprio layout raiz (fora do alcance de
// error.tsx). Sem isso, uma falha aqui deixa a tela em branco pra sempre,
// sem nenhuma indicação pro usuário do que houve.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-lg font-semibold text-zinc-900">Algo deu errado</p>
        <p className="max-w-xs text-sm text-zinc-500">
          Não foi possível carregar o Impulse. Tente novamente ou feche e abra o app de novo.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[#0c26b0] px-6 py-2 text-sm font-medium text-white"
        >
          Tentar de novo
        </button>
      </body>
    </html>
  );
}
