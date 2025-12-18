import { useState, useEffect } from "react";

interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: string;
  changePercent24h: string;
  positive: boolean;
}

const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws";

export const useCryptoPrice = (symbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});

  useEffect(() => {
    // Initialize with loading state
    const initialPrices: Record<string, CryptoPrice> = {};
    symbols.forEach((symbol) => {
      initialPrices[symbol] = {
        symbol,
        price: "0.00",
        change24h: "0.00",
        changePercent24h: "0.00",
        positive: true,
      };
    });
    setPrices(initialPrices);

    // Fetch initial prices from Binance API
    const fetchInitialPrices = async () => {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/ticker/24hr"
        );
        const data = await response.json();

        const updatedPrices: Record<string, CryptoPrice> = {};
        symbols.forEach((symbol) => {
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
    const streams = symbols.map((s) => `${s.toLowerCase()}usdt@ticker`).join("/");
    const ws = new WebSocket(`${BINANCE_WS_URL}/${streams}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const symbol = data.s?.replace("USDT", "") || "";

        if (symbols.includes(symbol)) {
          setPrices((prev) => ({
            ...prev,
            [symbol]: {
              symbol,
              price: parseFloat(data.c).toFixed(2),
              change24h: parseFloat(data.p).toFixed(2),
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
      ws.close();
    };
  }, [symbols.join(",")]);

  return prices;
};
