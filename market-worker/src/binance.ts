import WebSocket, { RawData } from "ws";
import { publishPrice } from "./publisher";

const STREAM_URL =
  "wss://stream.binance.com:9443/ws/btcusdt@ticker";

export function startBinanceWorker() {
  const ws = new WebSocket(STREAM_URL);

  ws.on("open", () => {
    console.log("✓ Binance WebSocket connected");
  });

  ws.on("message", async (data: RawData) => {
    const payload = JSON.parse(data.toString());

    await publishPrice({
      symbol: payload.s,
      price: payload.c,
      change: payload.P,
      time: Date.now(),
    });
  });

  ws.on("close", () => {
    console.warn("⚠ Binance WS closed. Reconnecting...");
    setTimeout(startBinanceWorker, 2000);
  });

  ws.on("error", (err: Error) => {
    console.error("❌ Binance WS error", err);
    ws.close();
  });
}
