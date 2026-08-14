import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";

export function BackLink({
  href,
  label,
  variant = "dark",
  className = "",
}: {
  href: string;
  label: string;
  variant?: "dark" | "auto";
  className?: string;
}) {
  const colorClass =
    variant === "dark"
      ? "text-white/70 hover:bg-white/10 hover:text-white"
      : "text-zinc-600 hover:bg-black/[.04] hover:text-foreground dark:text-zinc-400 dark:hover:bg-white/[.06]";

  return (
    <Link
      href={href}
      className={`-ml-2 flex w-fit items-center gap-1.5 rounded-full py-2 pl-2 pr-3 text-sm font-medium transition-colors ${colorClass} ${className}`}
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  );
}
