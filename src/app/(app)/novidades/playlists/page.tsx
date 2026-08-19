import { getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/back-link";
import { PlaylistsSection } from "@/components/playlists-section";

export default async function PlaylistsPage() {
  const [currentUser, playlists] = await Promise.all([
    getUser(),
    prisma.playlist.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 pt-2">
      <BackLink href="/novidades" label="Voltar" />

      <h1 className="text-2xl font-semibold tracking-tight text-white">Playlists</h1>

      <PlaylistsSection
        playlists={playlists}
        currentUserId={currentUser.id}
        isLider={currentUser.role === "LIDER"}
      />
    </div>
  );
}
