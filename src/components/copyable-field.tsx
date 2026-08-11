"use client";

import { useState, type ReactNode } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

export function CopyableField({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="shrink-0 text-yellow-300">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/40">{label}</p>
        <p className="truncate text-sm text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        title="Copiar"
        className="shrink-0 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-400" />
        ) : (
          <CopyIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
