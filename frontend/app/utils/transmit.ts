import { Subscription, Transmit } from "@adonisjs/transmit-client";
import { useEffect, useState } from "react";
import type { NotificationDTO } from "~/api/types";

function createTransmitClient() {
  if (typeof window !== "undefined") {
    try {
      return new Transmit({ baseUrl: window.location.origin });
    } catch (e) {
      // In case Transmit cannot initialize, keep client null and fall back to no-op
      // eslint-disable-next-line no-console
      console.warn("Transmit client init failed", e);
    }
  }
}

export function useTransmit() {
  const [client, _] = useState<Transmit | undefined>(createTransmitClient());

  const subscribe = (
    channelName: string,
    callback: (message: NotificationDTO) => void,
  ) => {
    if (!client) {
      return () => {};
    }

    let subscription: Subscription | undefined;
    let cancelled = false;

    (async () => {
      try {
        subscription = client.subscription(channelName);
        await subscription.create();

        if (cancelled) {
          try {
            await subscription.delete?.();
          } catch (e) {
            // ignore
          }
          return;
        }

        if (subscription.isCreated) {
          subscription.onMessage(callback);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Transmit subscribe failed", e);
      }
    })();

    // Return synchronous unsubscribe function so callers can cleanup safely
    return () => {
      cancelled = true;
      try {
        // attempt to remove handlers / close subscription if available
        subscription?.delete?.();
      } catch (e) {
        // ignore cleanup errors
      }
    };
  };

  return {
    subscribe,
  };
}

// Nota: si se necesita gestionar múltiples suscripciones/local state,
// reintroducir `subscriptions` y `setSubscriptions`.
