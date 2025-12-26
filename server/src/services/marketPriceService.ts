// import axios from 'axios';
import { prisma } from "../utils/prisma";

export type MarketPrice = {
  coinId: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

// // HARD-CODED CoinGecko IDs per symbol
// const COINGECKO_IDS: Record<string, string> = {
//   BTC: 'bitcoin',
//   ETH: 'ethereum',
//   USDT: 'tether',
//   XRP: 'ripple',
//   DOGE: 'dogecoin',
//   LTC: 'litecoin',
//   BCH: 'bitcoin-cash',
//   TRX: 'tron',
//   FIL: 'filecoin',
//   // add more as you need
// };

// let priceCache: Record<string, MarketPrice> = {};
// let lastUpdated = 0;
// const CACHE_TTL_MS = 15_000; // 15s

// async function loadActiveCoins() {
//   // Only coins we have a mapping for
//   const symbols = Object.keys(COINGECKO_IDS);

//   const coins = await prisma.coin.findMany({
//     where: {
//       isActive: true,
//       symbol: { in: symbols },
//     },
//   });

//   return coins;
// }

// export async function fetchMarketPrices(force = false): Promise<MarketPrice[]> {
//   const now = Date.now();

//   const cacheValid =
//     !force &&
//     Object.keys(priceCache).length > 0 &&
//     now - lastUpdated < CACHE_TTL_MS;

//   if (cacheValid) {
//     return Object.values(priceCache);
//   }

//   const coins = await loadActiveCoins();
//   if (!coins.length) return [];

//   const geckoIds = coins.map((c) => COINGECKO_IDS[c.symbol]).filter(Boolean);

//   const { data } = await axios.get(
//     'https://api.coingecko.com/api/v3/simple/price',
//     {
//       params: {
//         ids: geckoIds.join(','),
//         vs_currencies: 'usd',
//         include_24hr_change: true,
//       },
//     }
//   );

//   const prices: MarketPrice[] = coins.map((coin) => {
//     const geckoId = COINGECKO_IDS[coin.symbol];
//     const entry = data[geckoId];

//     return {
//       coinId: coin.id,
//       symbol: coin.symbol,
//       name: coin.name,
//       price: entry?.usd ?? 0,
//       change24h: entry?.usd_24h_change ?? 0,
//     };
//   });

//   priceCache = {};
//   for (const p of prices) {
//     priceCache[p.coinId] = p;
//   }
//   lastUpdated = now;

//   return prices;
// }

// export async function getMarketPriceForCoin(
//   coinId: string
// ): Promise<MarketPrice | null> {
//   const prices = await fetchMarketPrices();
//   return prices.find((p) => p.coinId === coinId) ?? null;
// }

// // Helper for WebSocket/batch lookups by symbol if you want
// export async function getMarketPriceBySymbol(
//   symbol: string
// ): Promise<MarketPrice | null> {
//   const coins = await prisma.coin.findMany({
//     where: { symbol },
//   });

//   if (!coins.length) return null;
//   return getMarketPriceForCoin(coins[0].id);
// }

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
console.log("Fetched market prices from CoinGecko", data);
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
