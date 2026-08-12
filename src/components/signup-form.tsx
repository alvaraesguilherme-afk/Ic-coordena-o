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
import { Field, authInputClass as inputClass } from "@/components/auth-field";
import { resizeImage } from "@/lib/image";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [role, setRole] = useState<"MEMBRO" | "LIDER" | "PASTOR">("MEMBRO");
  const isPastor = role === "PASTOR";
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
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
          className="group relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-300 shadow-[0_0_20px_-4px_rgba(250,204,21,0.8)]"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Prévia da foto de perfil" className="h-full w-full rounded-full object-cover" />
          ) : (
            <PersonIcon className="h-9 w-9 text-yellow-100" />
          )}
          <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-[#0c26b0] text-yellow-200 shadow-[0_0_12px_-2px_rgba(250,204,21,0.8)]">
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
        <p className="font-brand text-xs font-semibold text-white/70">
          {processingImage ? "Processando..." : "Tirar foto ou escolher da galeria"}
        </p>
        {(imageError || state?.errors?.avatar) && (
          <p className="text-xs font-medium text-yellow-200">
            {imageError ?? state?.errors?.avatar?.[0]}
          </p>
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

        {!isPastor && (
          <>
            <Field icon={<PhoneIcon className="h-5 w-5" />} error={state?.errors?.phone?.[0]}>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="(00) 00000-0000"
                required
                value={phone}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
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
          </>
        )}

        <Field icon={<LockIcon className="h-5 w-5" />}>
          <input id="password" name="password" type="password" placeholder="Senha" required className={inputClass} />
        </Field>
        {state?.errors?.password && (
          <div className="-mt-3 pl-3 text-xs font-medium text-yellow-200">
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
            onChange={(event) => setRole(event.target.value as "MEMBRO" | "LIDER" | "PASTOR")}
            className={`${inputClass} [&>option]:text-black`}
          >
            <option value="MEMBRO">Membro</option>
            <option value="LIDER">Líder da IC</option>
            <option value="PASTOR">Sou pastor</option>
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

        {isPastor && (
          <Field icon={<KeyIcon className="h-5 w-5" />} error={state?.errors?.pastorCode?.[0]}>
            <input
              id="pastorCode"
              name="pastorCode"
              placeholder="Código de pastor"
              className={inputClass}
            />
          </Field>
        )}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-white/40">
        Ao criar sua conta, o líder da sua rede poderá ver seu e-mail, telefone, endereço e data
        de nascimento pra te contatar. Fora da sua rede, só o seu nome, rede e IC ficam visíveis.
      </p>

      {state?.message && (
        <p className="text-center text-xs font-medium text-yellow-200">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending || isPending || processingImage}
        className="w-full rounded-full bg-gradient-to-b from-yellow-400 to-amber-500 py-3.5 font-brand text-lg font-extrabold uppercase tracking-wide text-[#0c26b0] shadow-[0_6px_0_0_#b8790a] transition active:translate-y-0.5 active:shadow-[0_2px_0_0_#b8790a] disabled:opacity-60"
      >
        {pending || isPending ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
