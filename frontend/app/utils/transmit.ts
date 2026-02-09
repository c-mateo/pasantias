// Transmit disabled in frontend — no-op fallback

export function getTransmit() {
  return undefined;
}

export function useTransmit() {
  // Return a small API compatible object if consumers expect a subscribe function
  return {
    subscribe: (_channelName: string, _callback: (message: any) => void) => {
      // noop unsubscribe
      return () => {};
    },
  } as const;
}
