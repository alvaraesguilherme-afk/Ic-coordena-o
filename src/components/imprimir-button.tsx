"use client";

export function ImprimirButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-full bg-[#0c1445] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
    >
      🖨️ Imprimir / Salvar como PDF
    </button>
  );
}
