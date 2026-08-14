import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Image
        src="/brand/logo-impulse.png"
        alt="Carregando"
        width={1122}
        height={792}
        priority
        unoptimized
        className="splash-logo h-auto w-16 drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]"
      />
    </div>
  );
}
