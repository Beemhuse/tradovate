import { useEffect, useState } from "react";
import { getKlines } from "@/services/binance";

type Props = {
  symbol: string;
  interval: string;
};

export default function TradingChart({ symbol, interval }: Props) {
  const [candles, setCandles] = useState<any[]>([]);

  useEffect(() => {
    getKlines(symbol, interval).then(setCandles);
  }, [symbol, interval]);

  return (
    <div className="h-[400px] bg-black rounded-lg p-2 text-white">
      {/* Replace with lightweight-charts or TradingView later */}
      <pre className="text-xs overflow-auto">
        {JSON.stringify(candles.slice(-5), null, 2)}
      </pre>
    </div>
  );
}
