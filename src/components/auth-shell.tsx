import type { ReactNode } from "react";
import Image from "next/image";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="brand-checker-bg relative flex flex-1 justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-16">
      <Image
        src="/brand/lightning.png"
        alt=""
        width={498}
        height={675}
        unoptimized
        style={{ width: "auto" }}
        className="pointer-events-none absolute right-5 top-5 h-16 sm:right-9 sm:top-9 sm:h-20"
      />
      <Image
        src="/brand/vinyl.png"
        alt=""
        width={165}
        height={165}
        unoptimized
        className="pointer-events-none absolute bottom-5 left-5 h-14 w-14 rounded-full object-cover sm:bottom-9 sm:left-9 sm:h-16 sm:w-16"
      />

      <div className="relative flex w-full max-w-sm flex-col items-center self-center gap-6">
        <Image
          src="/brand/logo-impulse.png"
          alt="Impulse"
          width={1122}
          height={792}
          priority
          unoptimized
          className="h-auto w-40 sm:w-48"
        />

        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
