import "server-only";
import { createClient } from "@supabase/supabase-js";

const AVATARS_BUCKET = "avatars";
const PLAYLIST_CAPAS_BUCKET = "playlist-capas";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados.");
  }

  return createClient(url, serviceRoleKey);
}

export function isUploadableFile(value: FormDataEntryValue | null): value is File {
  return !!value && typeof value === "object" && "arrayBuffer" in value && "size" in value;
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  return uploadImage(AVATARS_BUCKET, file, userId);
}

export async function uploadPlaylistCapa(file: File, userId: string): Promise<string> {
  return uploadImage(PLAYLIST_CAPAS_BUCKET, file, userId);
}

async function uploadImage(bucket: string, file: File, prefix: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato de imagem inválido. Use JPEG, PNG, WEBP ou GIF.");
  }
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("A foto deve ter no máximo 5MB.");
  }

  const supabase = getSupabaseAdmin();
  const extension = file.type.split("/")[1];
  const path = `${prefix}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(`Falha ao enviar a foto: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
