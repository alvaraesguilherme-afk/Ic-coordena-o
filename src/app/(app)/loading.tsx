import { BandeiraAnimada } from "@/components/bandeira-animada";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <BandeiraAnimada width={72} aceso />
    </div>
  );
}
