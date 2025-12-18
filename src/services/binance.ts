import axios from "axios";

const BINANCE_BASE = "https://api.binance.com/api/v3";

export const getKlines = async (
  symbol: string,
  interval: string,
  limit = 200
) => {
  const { data } = await axios.get(`${BINANCE_BASE}/klines`, {
    params: { symbol, interval, limit },
  });

  return data.map((k: any) => ({
    time: k[0],
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }));
};

export const getTicker = async (symbol: string) => {
  const { data } = await axios.get(
    `${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`
  );
  return data;
};
