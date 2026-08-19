"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { createAviso } from "@/app/actions/avisos";
import type { AvisoFormState } from "@/lib/definitions";
import { resizeImage } from "@/lib/image";

const inputClass =
  "rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none";

export function AvisoForm() {
  const [result, setResult] = useState<AvisoFormState>(undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [capaBlob, setCapaBlob] = useState<Blob | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCapaChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    try {
      const resized = await resizeImage(file, 1024);
      setCapaBlob(resized);
      setPreview(URL.createObjectURL(resized));
    } catch {
      setCapaBlob(null);
      setPreview(null);
    } finally {
      setProcessingImage(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (capaBlob) {
      formData.set("capa", capaBlob, "capa.jpg");
    }

    startTransition(async () => {
      const response = await createAviso(undefined, formData);
      if (response?.message === "success") {
        setResult(undefined);
        setPreview(null);
        setCapaBlob(null);
        formRef.current?.reset();
      } else {
        setResult(response);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-black/20 bg-black/5"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[11px] text-[#666]">Capa</span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCapaChange}
          className="hidden"
        />
        <p className="text-xs text-[#666]">
          {processingImage ? "Processando..." : "Capa (opcional) — pode ser só a arte do aviso"}
        </p>
      </div>

      <input name="titulo" placeholder="Título (opcional)" className={inputClass} />
      {result?.errors?.titulo && <p className="text-sm text-red-600">{result.errors.titulo[0]}</p>}

      <textarea
        name="conteudo"
        placeholder="Escreva o aviso..."
        rows={3}
        required
        className={inputClass}
      />
      {result?.errors?.conteudo && (
        <p className="text-sm text-red-600">{result.errors.conteudo[0]}</p>
      )}

      <input name="link" type="url" placeholder="Link (opcional)" className={inputClass} />
      {result?.errors?.link && <p className="text-sm text-red-600">{result.errors.link[0]}</p>}

      <div className="flex flex-col gap-2 border-t border-black/10 pt-3">
        <p className="text-xs text-[#666]">
          Tem data e local? Preencha abaixo pra virar um evento.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="datetime-local"
            name="dataEvento"
            className={`${inputClass} sm:flex-1`}
          />
          <input
            name="local"
            placeholder="Local (opcional)"
            className={`${inputClass} sm:flex-1`}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-black/10 pt-3">
        <label className="text-xs text-[#666]">Some sozinho a partir de (opcional)</label>
        <input type="date" name="expiraEm" className={`${inputClass} w-fit`} />
      </div>
      {result?.errors?.expiraEm && (
        <p className="text-sm text-red-600">{result.errors.expiraEm[0]}</p>
      )}

      {result?.message && result.message !== "success" && (
        <p className="text-sm text-red-600">{result.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending || processingImage}
        className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {isPending ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}
