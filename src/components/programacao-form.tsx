"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { createProgramacao } from "@/app/actions/programacao";
import type { ProgramacaoFormState } from "@/lib/definitions";
import { LinkIcon } from "@/components/icons";
import { resizeImage } from "@/lib/image";

const inputClass =
  "w-full rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function ProgramacaoForm() {
  const [result, setResult] = useState<ProgramacaoFormState>(undefined);
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
      const response = await createProgramacao(undefined, formData);
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

  function handleCancel() {
    setResult(undefined);
    setPreview(null);
    setCapaBlob(null);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
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
          {processingImage ? "Processando..." : "Capa (opcional)"}
        </p>
      </div>

      <input name="titulo" placeholder="Título (opcional)" className={inputClass} />
      {result?.errors?.titulo && <p className="text-sm text-red-300">{result.errors.titulo[0]}</p>}

      <textarea
        name="conteudo"
        placeholder="Escreva a programação..."
        rows={3}
        required
        className={inputClass}
      />
      {result?.errors?.conteudo && (
        <p className="text-sm text-red-300">{result.errors.conteudo[0]}</p>
      )}

      <input name="link" type="url" placeholder="Link (opcional)" className={inputClass} />
      {result?.errors?.link && <p className="text-sm text-red-300">{result.errors.link[0]}</p>}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input type="datetime-local" name="dataEvento" className={`${inputClass} sm:flex-1`} />
        <input name="local" placeholder="Local (opcional)" className={`${inputClass} sm:flex-1`} />
      </div>
      {result?.errors?.dataEvento && (
        <p className="text-sm text-red-300">{result.errors.dataEvento[0]}</p>
      )}
      {result?.errors?.local && <p className="text-sm text-red-300">{result.errors.local[0]}</p>}

      {result?.message && result.message !== "success" && (
        <p className="text-sm text-red-300">{result.message}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || processingImage}
          className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
        >
          {isPending ? "Publicando..." : "Publicar"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className="w-fit rounded-full px-5 py-2 text-sm font-medium text-white/60 transition-opacity hover:text-white disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
