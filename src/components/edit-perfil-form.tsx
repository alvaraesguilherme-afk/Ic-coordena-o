"use client";

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { updatePerfil } from "@/app/actions/perfil";
import { resizeImage } from "@/lib/image";
import { roleLabel, roleBadgeClass } from "@/lib/user";
import { formatPhone } from "@/lib/phone";
import { PersonIcon, CameraIcon } from "@/components/icons";

export function EditPerfilHeader({
  name,
  avatarUrl,
  role,
  isAdmin,
  liderDeRede,
  phone,
  birthDateStr,
}: {
  name: string;
  avatarUrl: string | null;
  role: "LIDER" | "MEMBRO" | "PASTOR";
  isAdmin: boolean;
  liderDeRede: boolean;
  phone: string | null;
  birthDateStr: string;
}) {
  const [state, action, pending] = useActionState(updatePerfil, undefined);
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState(phone ?? "");
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
          <span
            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${roleBadgeClass({ role, isAdmin, liderDeRede })}`}
          >
            {roleLabel({ role, isAdmin, liderDeRede })}
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

      <div className="flex w-full max-w-xs flex-col gap-2">
        <label className="pl-3 text-xs font-medium text-white/50">Telefone</label>
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="(00) 00000-0000"
          value={phoneValue}
          onChange={(event) => setPhoneValue(formatPhone(event.target.value))}
          className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-sm text-white outline-none focus:border-yellow-400/50"
        />
        {state?.errors?.phone && (
          <p className="text-center text-xs font-medium text-yellow-200">{state.errors.phone[0]}</p>
        )}
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <label htmlFor="edit-birthDate" className="pl-3 text-xs font-medium text-white/50">
          Data de nascimento
        </label>
        <input
          id="edit-birthDate"
          name="birthDate"
          type="date"
          defaultValue={birthDateStr}
          required
          className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-center text-sm text-white outline-none [color-scheme:dark] focus:border-yellow-400/50"
        />
        {state?.errors?.birthDate && (
          <p className="text-center text-xs font-medium text-yellow-200">{state.errors.birthDate[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-xs font-medium text-yellow-200">{state.message}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setPreview(avatarUrl);
            setAvatarBlob(null);
            setImageError(null);
            setPhoneValue(phone ?? "");
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
