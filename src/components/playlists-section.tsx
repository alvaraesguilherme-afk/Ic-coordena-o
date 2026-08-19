import { PlaylistForm } from "@/components/playlist-form";
import { PlaylistCard } from "@/components/playlist-card";

type Playlist = {
  id: string;
  titulo: string;
  url: string;
  capaUrl: string;
  autorId: string;
};

export function PlaylistsSection({
  playlists,
  currentUserId,
  isLider,
}: {
  playlists: Playlist[];
  currentUserId: string;
  isLider: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-white/60">
        Bora colocar sua playlist aqui! 🎧 Qualquer um pode adicionar a sua — mostra o que tá bombando no
        seu fone essa semana.
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <PlaylistForm />
        {playlists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            id={playlist.id}
            titulo={playlist.titulo}
            url={playlist.url}
            capaUrl={playlist.capaUrl}
            podeExcluir={isLider || playlist.autorId === currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
