import { useEffect, useState } from "react";
import { getTicker } from "@/services/binance";
import TradingChart from "@/components/trade/tradingChart";
import OrderPanel from "@/components/trade/orderPanel";

export default function TradePage() {
  const symbol = "BTCUSDT";
  const pairId = "PAIR_UUID_FROM_DB";

  const [price, setPrice] = useState(0);
  const [interval, setInterval] = useState("1m");

  useEffect(() => {
    const load = async () => {
      const ticker = await getTicker(symbol);
      setPrice(Number(ticker.lastPrice));
    };
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-black min-h-screen">
      <div className="col-span-2">
        <h1 className="text-green-400 text-2xl mb-2">
          BTC/USDT {price.toFixed(2)}
        </h1>

        <div className="flex gap-2 mb-2">
          {["1m", "5m", "15m", "1h", "1d"].map((t) => (
            <button
              key={t}
              onClick={() => setInterval(t)}
              className="bg-gray-800 px-3 py-1 rounded text-white"
            >
              {t}
            </button>
          ))}
        </div>

        <TradingChart symbol={symbol} interval={interval} />
      </div>

      <OrderPanel pairId={pairId} price={price} />
    </div>
  );
}
