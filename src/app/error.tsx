"use client";

// Cobre erros dentro das páginas normais (fora do layout raiz). Sem isso, a
// tela também fica em branco em vez de mostrar algo pro usuário.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <p className="text-lg font-semibold text-zinc-900">Algo deu errado</p>
      <p className="max-w-xs text-sm text-zinc-500">
        Não foi possível carregar essa tela. Tente novamente.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[#0c26b0] px-6 py-2 text-sm font-medium text-white"
      >
        Tentar de novo
      </button>
    </div>
  );
}
