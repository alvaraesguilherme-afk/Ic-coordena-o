export type PlataformaPlaylist = "spotify" | "youtube";

const ICONE_POR_PLATAFORMA: Record<PlataformaPlaylist, string> = {
  spotify: "/brand/platforms/spotify.png",
  youtube: "/brand/platforms/youtube.png",
};

export function detectarPlataforma(url: string): PlataformaPlaylist | null {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }

  if (host.includes("spotify.com")) return "spotify";
  if (host.includes("youtube.com") || host.includes("youtu.be") || host.includes("music.youtube.com")) {
    return "youtube";
  }
  return null;
}

export function iconePlataforma(url: string): string | null {
  const plataforma = detectarPlataforma(url);
  return plataforma ? ICONE_POR_PLATAFORMA[plataforma] : null;
}
