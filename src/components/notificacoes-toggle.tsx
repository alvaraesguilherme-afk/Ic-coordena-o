"use client";

import { useEffect, useState, useTransition } from "react";
import { setNotificacoes } from "@/app/actions/perfil";
import { saveSubscription, removeSubscription } from "@/app/actions/push";
import { subscribeToPush, unsubscribeFromPush, getExistingSubscription } from "@/lib/push-client";
import { BandeiraAnimada } from "@/components/bandeira-animada";

type DeviceStatus = "checking" | "ativo" | "inativo" | "bloqueado" | "indisponivel";

export function NotificacoesToggle({ ativo }: { ativo: boolean }) {
  const [checked, setChecked] = useState(ativo);
  const [isPending, startTransition] = useTransition();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>("checking");

  useEffect(() => {
    if (deviceStatus !== "checking") return;

    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setDeviceStatus("indisponivel");
      return;
    }
    if (Notification.permission === "denied") {
      setDeviceStatus("bloqueado");
      return;
    }

    getExistingSubscription()
      .then((sub) => setDeviceStatus(sub ? "ativo" : "inativo"))
      .catch(() => setDeviceStatus("inativo"));
  }, [deviceStatus]);

  async function ativarNesteAparelho() {
    try {
      const subscription = await subscribeToPush();
      if (!subscription) {
        setDeviceStatus(Notification.permission === "denied" ? "bloqueado" : "inativo");
        return;
      }
      await saveSubscription(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setDeviceStatus("ativo");
    } catch {
      setDeviceStatus("inativo");
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isPending}
        onClick={() => {
          const next = !checked;
          setChecked(next);
          startTransition(() => setNotificacoes(next));

          if (next) {
            void ativarNesteAparelho();
          } else {
            unsubscribeFromPush().then((endpoint) => {
              if (endpoint) void removeSubscription(endpoint);
            });
          }
        }}
        className="shrink-0 disabled:opacity-60"
      >
        <BandeiraAnimada width={56} aceso={checked} />
      </button>

      {checked && deviceStatus === "inativo" && (
        <button
          type="button"
          onClick={ativarNesteAparelho}
          className="text-xs text-yellow-300 hover:underline"
        >
          Ativar neste aparelho
        </button>
      )}
      {checked && deviceStatus === "bloqueado" && (
        <p className="max-w-[10rem] text-right text-xs text-white/40">
          Bloqueado no navegador
        </p>
      )}
    </div>
  );
}
