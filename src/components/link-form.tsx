"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { createLink } from "@/app/actions/links";
import type { LinkFormState } from "@/lib/definitions";
import type { CategoriaLink } from "@/lib/links";
import { LinkIcon } from "@/components/icons";
import { resizeImage } from "@/lib/image";

const inputClass =
  "w-full rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function LinkForm({ categoria }: { categoria: CategoriaLink }) {
  const [result, setResult] = useState<LinkFormState>(undefined);
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
    if (!capaBlob) return;

    const formData = new FormData(event.currentTarget);
    formData.set("capa", capaBlob, "capa.jpg");

    startTransition(async () => {
      const response = await createLink(undefined, formData);
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
      <input type="hidden" name="categoria" value={categoria} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-yellow-300/60 bg-white/5"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <LinkIcon className="h-6 w-6 text-yellow-200" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCapaChange}
          className="hidden"
        />
        <p className="text-xs text-white/50">
          {processingImage ? "Processando..." : "Escolha uma foto de capa"}
        </p>
      </div>
      {result?.errors?.capa && <p className="text-sm text-red-300">{result.errors.capa[0]}</p>}

      <input name="titulo" placeholder="Título do link" required className={inputClass} />
      {result?.errors?.titulo && <p className="text-sm text-red-300">{result.errors.titulo[0]}</p>}

      <input name="url" type="url" placeholder="https://..." required className={inputClass} />
      {result?.errors?.url && <p className="text-sm text-red-300">{result.errors.url[0]}</p>}

      {result?.message && result.message !== "success" && (
        <p className="text-sm text-red-300">{result.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending || processingImage || !capaBlob}
        className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
      >
        {isPending ? "Adicionando..." : "Adicionar"}
      </button>
    </form>
  );
}
