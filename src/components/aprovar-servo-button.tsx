"use client";

import { useTransition } from "react";
import { aprovarServoMidia, recusarServoMidia } from "@/app/actions/servo";

export function AprovarServoButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => aprovarServoMidia(userId))}
        className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-[#0c1445] disabled:opacity-60"
      >
        Aprovar
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => recusarServoMidia(userId))}
        className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white/60 hover:bg-white/10 disabled:opacity-60"
      >
        Recusar
      </button>
    </div>
  );
}
