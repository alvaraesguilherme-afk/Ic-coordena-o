"use client";

import { useTransition } from "react";
import { deleteLink } from "@/app/actions/links";

export function DeleteLinkButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Remover este link?")) {
          startTransition(() => deleteLink(id));
        }
      }}
      className="text-sm text-red-300 hover:underline disabled:opacity-60"
    >
      Remover
    </button>
  );
}
