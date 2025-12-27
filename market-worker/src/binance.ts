import WebSocket from "ws";
import { publishPrice } from "./publisher";

const BINANCE_WS = "wss://stream.binance.com:9443/ws/btcusdt@ticker";

export function startBinanceWorker() {
  const ws = new WebSocket(BINANCE_WS);

  ws.on("open", () => {
    console.log("✓ Binance WS connected");
  });

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());

    publishPrice({
      symbol: data.s,
      price: data.c,
      time: Date.now(),
    });
  });

  ws.on("close", () => {
    console.log("⚠ Binance WS closed. Reconnecting...");
    setTimeout(startBinanceWorker, 2000);
  });

  ws.on("error", (err) => {
    console.error("❌ Binance WS error", err);
    ws.close();
  });
}
