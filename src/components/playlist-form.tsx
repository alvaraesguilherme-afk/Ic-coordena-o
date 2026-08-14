"use client";

import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { createPlaylist } from "@/app/actions/playlists";
import type { PlaylistFormState } from "@/lib/definitions";
import { MusicIcon, PlusIcon, XIcon } from "@/components/icons";
import { resizeImage } from "@/lib/image";

const inputClass =
  "w-full rounded-md border border-white/15 bg-white/95 px-3 py-2 text-sm text-black outline-none";

export function PlaylistForm() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<PlaylistFormState>(undefined);
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
      const resized = await resizeImage(file);
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
      const response = await createPlaylist(undefined, formData);
      if (response?.message === "success") {
        reset();
      } else {
        setResult(response);
      }
    });
  }

  function reset() {
    setOpen(false);
    setResult(undefined);
    setPreview(null);
    setCapaBlob(null);
    formRef.current?.reset();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/25 text-white/50 transition-colors hover:border-yellow-400/50 hover:text-yellow-200"
      >
        <PlusIcon className="h-5 w-5" />
        <span className="text-[11px] font-medium">Nova playlist</span>
      </button>
    );
  }

  return (
    <div className="col-span-full rounded-2xl border border-white/15 bg-gradient-to-b from-white/[.09] to-white/[.02] p-4 shadow-lg shadow-black/30">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Nova playlist</p>
        <button type="button" onClick={reset} className="text-white/50 hover:text-white">
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-yellow-300/60 bg-white/5"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : (
              <MusicIcon className="h-6 w-6 text-yellow-200" />
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

        <input name="titulo" placeholder="Nome da playlist" required className={inputClass} />
        {result?.errors?.titulo && <p className="text-sm text-red-300">{result.errors.titulo[0]}</p>}

        <input name="url" type="url" placeholder="Link de acesso (https://...)" required className={inputClass} />
        {result?.errors?.url && <p className="text-sm text-red-300">{result.errors.url[0]}</p>}

        {result?.message && result.message !== "success" && (
          <p className="text-sm text-red-300">{result.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending || processingImage || !capaBlob}
          className="w-fit rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-[#0c1445] transition-opacity disabled:opacity-60"
        >
          {isPending ? "Criando..." : "Criar playlist"}
        </button>
      </form>
    </div>
  );
}
