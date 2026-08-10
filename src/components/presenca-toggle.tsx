"use client";

import { useTransition } from "react";
import { setPresenca } from "@/app/actions/reunioes";

export function PresencaToggle({
  reuniaoId,
  userId,
  presente,
}: {
  reuniaoId: string;
  userId: string;
  presente: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={presente}
        disabled={isPending}
        onChange={(event) => {
          const checked = event.target.checked;
          startTransition(() => setPresenca(reuniaoId, userId, checked));
        }}
        className="h-4 w-4"
      />
      Presente
    </label>
  );
}
