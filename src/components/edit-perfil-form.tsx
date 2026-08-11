"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { updatePerfil } from "@/app/actions/perfil";
import { resizeImage } from "@/lib/image";
import { roleLabel } from "@/lib/user";
import { PersonIcon, CameraIcon } from "@/components/icons";

export function EditPerfilHeader({
  name,
  avatarUrl,
  role,
  isAdmin,
}: {
  name: string;
  avatarUrl: string | null;
  role: "LIDER" | "MEMBRO";
  isAdmin: boolean;
}) {
  const [state, action, pending] = useActionState(updatePerfil, undefined);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
      setAvatarBlob(null);
    }
  }, [state]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError(null);
    try {
      const resized = await resizeImage(file);
      setAvatarBlob(resized);
      setPreview(URL.createObjectURL(resized));
    } catch {
      setImageError("Não foi possível processar essa imagem. Tente outra foto.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (avatarBlob) {
      formData.set("avatar", avatarBlob, "avatar.jpg");
    }
    startTransition(() => {
      action(formData);
    });
  }

  if (!editing) {
    return (
      <>
        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-yellow-400/50 bg-white/10">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <PersonIcon className="h-full w-full p-6 text-white/40" />
          )}
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{name}</h1>
          <span className="mt-1 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
            {roleLabel({ role, isAdmin })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
        >
          Editar perfil
        </button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-yellow-400/50 bg-white/10"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <PersonIcon className="h-full w-full p-6 text-white/40" />
        )}
        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#0c1445] text-yellow-300">
          <CameraIcon className="h-4 w-4" />
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
      {imageError && <p className="text-xs font-medium text-yellow-200">{imageError}</p>}

      <input
        name="name"
        defaultValue={name}
        required
        className="w-full max-w-xs rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-lg font-semibold text-white outline-none focus:border-yellow-400/50"
      />
      {state?.errors?.name && (
        <p className="text-xs font-medium text-yellow-200">{state.errors.name[0]}</p>
      )}
      {state?.message && <p className="text-xs font-medium text-yellow-200">{state.message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setPreview(avatarUrl);
            setAvatarBlob(null);
            setImageError(null);
          }}
          className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending || isPending}
          className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445] disabled:opacity-60"
        >
          {pending || isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
