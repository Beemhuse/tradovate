import { useState, useEffect } from "react";

interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: string;
  changePercent24h: string;
  positive: boolean;
}

const BINANCE_WS_BASE_URL = "wss://nameless-leaf-1705.brightawah94.workers.dev/stream";

export const useCryptoPrice = (symbols: string[] = []) => {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});

  useEffect(() => {
    // If no symbols provided, do nothing
    if (!symbols || symbols.length === 0) return;

    // Filter out invalid symbols (like raw 'USDT' which has no pair against itself on this stream)
    // and remove duplicates
    const activeSymbols = [...new Set(
      symbols
        .filter((s) => s && typeof s === 'string' && s.toUpperCase() !== "USDT")
        .map((s) => s.toUpperCase())
    )];

    if (activeSymbols.length === 0) return;

    // Initialize with default values
    const initialPrices: Record<string, CryptoPrice> = {};
    activeSymbols.forEach((symbol) => {
      initialPrices[symbol] = {
        symbol,
        price: "0.00",
        change24h: "0.00",
        changePercent24h: "0.00",
        positive: true,
      };
    });
    setPrices(initialPrices);

    // Fetch initial prices from Binance API (REST)
    const fetchInitialPrices = async () => {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr"
        );
        const data = await response.json();

        const updatedPrices: Record<string, CryptoPrice> = {};
        activeSymbols.forEach((symbol) => {
          // Look for SYMBOL + USDT (e.g. BTCUSDT)
          const ticker = data.find(
            (t: any) => t.symbol === `${symbol}USDT`
          );
          if (ticker) {
            updatedPrices[symbol] = {
              symbol,
              price: parseFloat(ticker.lastPrice).toFixed(2),
              change24h: parseFloat(ticker.priceChange).toFixed(2),
              changePercent24h: parseFloat(ticker.priceChangePercent).toFixed(2),
              positive: parseFloat(ticker.priceChangePercent) >= 0,
            };
          }
        });
        setPrices((prev) => ({ ...prev, ...updatedPrices }));
      } catch (error) {
        console.error("Error fetching initial prices:", error);
      }
    };

    fetchInitialPrices();

    // WebSocket connection for real-time updates
    const streamNames = activeSymbols.map((s) => `${s.toLowerCase()}usdt@ticker`).join("/");
    const wsUrl = `${BINANCE_WS_BASE_URL}?streams=${streamNames}`;

    // console.log("Connecting to Binance WS:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        // Combined stream payload structure: { stream: "...", data: { ... } }
        const data = message.data || message;

        // data.s is the symbol coming back, e.g. "BTCUSDT"
        if (!data || !data.s) return;

        const incomingSymbol = data.s.replace("USDT", ""); // "BTC"
        // console.log("incomingSymbol", data);
        

        if (activeSymbols.includes(incomingSymbol)) {
          setPrices((prev) => ({
            ...prev,
            [incomingSymbol]: {
              symbol: incomingSymbol,
              price: parseFloat(data.c).toFixed(2),
              change24h: parseFloat(data.q).toFixed(2),
              changePercent24h: parseFloat(data.P).toFixed(2),
              positive: parseFloat(data.P) >= 0,
            },
          }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [JSON.stringify(symbols)]); // Dependency on stringified symbols so array ref changes don't re-trigger unnecessarily if content is same

  return prices;
};
