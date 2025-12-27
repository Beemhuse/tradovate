// import axios from 'axios';
import { prisma } from "../utils/prisma";

export type MarketPrice = {
  coinId: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

import axios from "axios";
import { EventEmitter } from "events";

export const priceEvents = new EventEmitter();

const CACHE_TTL = 8000;
let lastUpdated = 0;
let priceCache: any = {};

const COIN_MAP = {
  BTC: "bitcoin",
  ETH: "ethereum",
  XRP: "ripple",
  DOGE: "dogecoin",
  BCH: "bitcoin-cash",
  LTC: "litecoin",
  TRX: "tron",
  FIL: "filecoin",
};

export async function fetchPrices() {
  const now = Date.now();
  if (now - lastUpdated < CACHE_TTL) return priceCache;

  const ids = Object.values(COIN_MAP).join(",");

  const url = `https://api.coingecko.com/api/v3/simple/price`;

  const { data } = await axios.get(url, {
    params: {
      ids,
      vs_currencies: "usd",
      include_24hr_change: true,
    },
  });
  const formatted: any = {};
  Object.entries(COIN_MAP).forEach(([symbol, cgId]) => {
    if (data[cgId]) {
      formatted[symbol] = {
        symbol,
        price: data[cgId].usd,
        change24h: data[cgId].usd_24h_change,
      };
    }
  });

  priceCache = formatted;
  lastUpdated = now;

  return formatted;
}

// Called by WebSocket price feed (real-time)
export function updatePrice(symbol: string, price: number, change24h?: number) {
  if (!priceCache[symbol]) return;

  priceCache[symbol].price = price;

  if (change24h !== undefined) {
    priceCache[symbol].change24h = change24h;
  }

  priceEvents.emit("priceUpdate", {
    symbol,
    price,
    change24h: priceCache[symbol].change24h,
  });
}

export async function getMarketPriceForCoin(
  coinId: string
): Promise<MarketPrice | null> {
  const prices = await fetchPrices();
  return prices.find((p: { coinId: string }) => p.coinId === coinId) ?? null;
}

// Helper for WebSocket/batch lookups by symbol if you want
export async function getMarketPriceBySymbol(
  symbol: string
): Promise<MarketPrice | null> {
  const coins = await prisma.coin.findMany({
    where: { symbol },
  });

  if (!coins.length) return null;
  return getMarketPriceForCoin(coins[0].id);
}
export const klineEvents = new EventEmitter();

export function updateKline(kline: {
  symbol: string;
  interval: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isClosed: boolean;
  timestamp: number;
}) {
  klineEvents.emit("klineUpdate", kline);
}
