"use client";

import { useActionState, useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { signup } from "@/app/actions/auth";
import {
  PersonIcon,
  MailIcon,
  LockIcon,
  CalendarIcon,
  PhoneIcon,
  MapPinIcon,
  UsersIcon,
  KeyIcon,
  CameraIcon,
} from "@/components/icons";

async function resizeImage(file: File, maxDimension = 512, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Não foi possível processar a imagem."))),
      "image/jpeg",
      quality
    );
  });
}

function Field({
  icon,
  error,
  children,
}: {
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3 border-b border-white/25 pb-2 focus-within:border-cyan-300">
        <span className="shrink-0 text-white/60">{icon}</span>
        {children}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

const inputClass = "w-full bg-transparent text-base text-white placeholder-white/50 outline-none";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [role, setRole] = useState<"MEMBRO" | "LIDER">("MEMBRO");
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingImage(true);
    setImageError(null);
    try {
      const resized = await resizeImage(file);
      setAvatarBlob(resized);
      setPreview(URL.createObjectURL(resized));
    } catch {
      setImageError("Não foi possível processar essa imagem. Tente outra foto.");
      setAvatarBlob(null);
      setPreview(null);
    } finally {
      setProcessingImage(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!avatarBlob) {
      setImageError("A foto de perfil é obrigatória.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set("avatar", avatarBlob, "avatar.jpg");

    startTransition(() => {
      action(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-300/80 shadow-[0_0_25px_-5px_rgba(34,211,238,0.9)]"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Prévia da foto de perfil" className="h-full w-full rounded-full object-cover" />
          ) : (
            <PersonIcon className="h-9 w-9 text-cyan-100" />
          )}
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#0a0e2e] text-cyan-200 shadow-[0_0_15px_-3px_rgba(34,211,238,0.9)]">
            <CameraIcon className="h-3.5 w-3.5" />
          </span>
        </button>
        <input
          ref={fileInputRef}
          id="avatar-input"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-xs text-white/60">
          {processingImage ? "Processando..." : "Tirar foto ou escolher da galeria"}
        </p>
        {(imageError || state?.errors?.avatar) && (
          <p className="text-xs text-red-300">{imageError ?? state?.errors?.avatar?.[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <Field icon={<PersonIcon className="h-5 w-5" />} error={state?.errors?.name?.[0]}>
          <input id="name" name="name" placeholder="Nome completo" required className={inputClass} />
        </Field>

        <Field icon={<MailIcon className="h-5 w-5" />} error={state?.errors?.email?.[0]}>
          <input id="email" name="email" type="email" placeholder="Email" required className={inputClass} />
        </Field>

        <Field icon={<CalendarIcon className="h-5 w-5" />} error={state?.errors?.birthDate?.[0]}>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            required
            className={`${inputClass} [color-scheme:dark]`}
          />
        </Field>

        <Field icon={<PhoneIcon className="h-5 w-5" />} error={state?.errors?.phone?.[0]}>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            required
            className={inputClass}
          />
        </Field>

        <Field icon={<MapPinIcon className="h-5 w-5" />} error={state?.errors?.address?.[0]}>
          <input
            id="address"
            name="address"
            placeholder="Rua, número, bairro, cidade - UF"
            required
            className={inputClass}
          />
        </Field>

        <Field icon={<LockIcon className="h-5 w-5" />}>
          <input id="password" name="password" type="password" placeholder="Senha" required className={inputClass} />
        </Field>
        {state?.errors?.password && (
          <div className="-mt-3 text-xs text-red-300">
            {state.errors.password.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <Field icon={<UsersIcon className="h-5 w-5" />} error={state?.errors?.role?.[0]}>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as "MEMBRO" | "LIDER")}
            className={`${inputClass} [&>option]:text-black`}
          >
            <option value="MEMBRO">Membro</option>
            <option value="LIDER">Líder da IC</option>
          </select>
        </Field>

        {role === "LIDER" && (
          <Field icon={<KeyIcon className="h-5 w-5" />} error={state?.errors?.inviteCode?.[0]}>
            <input
              id="inviteCode"
              name="inviteCode"
              placeholder="Código de convite de líder"
              className={inputClass}
            />
          </Field>
        )}
      </div>

      {state?.message && <p className="text-xs text-red-300">{state.message}</p>}

      <button
        type="submit"
        disabled={pending || isPending || processingImage}
        className="w-full rounded-full border border-white/20 bg-white/10 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_30px_-8px_rgba(34,211,238,0.7)] transition hover:bg-white/20 disabled:opacity-60"
      >
        {pending || isPending ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
