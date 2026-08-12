"use client";

import { useTransition } from "react";
import { promoverVeteranoMidia } from "@/app/actions/servo";

export function PromoverVeteranoButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => promoverVeteranoMidia(userId))}
      className="rounded-full border border-yellow-400/40 px-3 py-1 text-xs font-medium text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-60"
    >
      {isPending ? "Promovendo..." : "Promover a veterano"}
    </button>
  );
}
