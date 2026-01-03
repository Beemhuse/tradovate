import { useEffect, useRef, useState } from "react";

type MiniTickerMessage = {
  stream: string;
  data: {
    s: string; // symbol
    c: string; // close price
  };
};

export const useLivePrice = (wsSymbol: string) => {
  const [price, setPrice] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsSymbol) return;

    const ws = new WebSocket(
      `wss://nameless-leaf-1705.brightawah94.workers.dev/stream?streams=${wsSymbol}@miniTicker`
    );

    wsRef.current = ws;

    ws.onopen = () => {
    };

    ws.onmessage = (event: MessageEvent) => {
      const payload: MiniTickerMessage = JSON.parse(event.data);
      const livePrice = Number(payload.data.c);
      if (!Number.isNaN(livePrice)) {
        setPrice(livePrice);
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WS error", err);
    };

    ws.onclose = () => {
      console.log("🔌 WS closed:", wsSymbol);
    };

    return () => {
      ws.close();
    };
  }, [wsSymbol]);

  return price;
};
