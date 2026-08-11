"use client";

import { useState, type ReactNode } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

const PREVIEW_LENGTH = 32;

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
  const [expanded, setExpanded] = useState(false);

  const isLong = value.length > PREVIEW_LENGTH;
  const displayValue = isLong && !expanded ? `${value.slice(0, PREVIEW_LENGTH)}…` : value;

  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <span className="mt-0.5 shrink-0 text-yellow-300">{icon}</span>
      <button
        type="button"
        onClick={() => isLong && setExpanded((e) => !e)}
        disabled={!isLong}
        className="min-w-0 flex-1 text-left"
      >
        <p className="text-xs text-white/40">{label}</p>
        <p className={`text-sm text-white ${expanded ? "break-words" : "truncate"}`}>
          {displayValue}
        </p>
        {isLong && (
          <span className="text-[11px] font-medium text-yellow-300/80">
            {expanded ? "ver menos" : "ver mais"}
          </span>
        )}
      </button>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        title="Copiar"
        className="mt-0.5 shrink-0 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
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
