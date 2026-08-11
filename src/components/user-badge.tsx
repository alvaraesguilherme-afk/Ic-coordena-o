import { getUser } from "@/lib/dal";
import { roleLabel } from "@/lib/user";

export async function UserBadge() {
  const currentUser = await getUser();

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[.06] px-4 py-2 backdrop-blur-xl">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
        {currentUser.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">{currentUser.name}</p>
        <p className="text-[11px] text-white/50">{roleLabel(currentUser)}</p>
      </div>
    </div>
  );
}
