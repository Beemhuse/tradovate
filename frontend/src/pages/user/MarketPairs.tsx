import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFetchData } from "@/hooks/use-api";
import MarketRow from "@/components/trade/marketRow";

type MarketPair = {
  id: string;
  symbol: string;
  wsSymbol: string; // e.g. "dogeusdt"
  baseCoin: {
    symbol: string;
    name: string;
    iconUrl?: string;
  };
};

type MiniTicker = {
  s: string; // symbol
  c: string; // last price
  o: string; // open price
};

const MarketPairs = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFetchData("/market/pairs", ["market-pairs"]);
  const [prices, setPrices] = useState<
    Record<string, { price: number; change: number }>
  >({});

  const [history, setHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (!data?.pairs?.length) return;

    const streams = data.pairs
      .map((p: MarketPair) => `${p.wsSymbol}@miniTicker`)
      .join("/");

    const ws = new WebSocket(
      `wss://nameless-leaf-1705.brightawah94.workers.dev/stream?streams=${streams}`
    );

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const tick = payload.data;

      const symbolKey = tick.s.toLowerCase();
      const last = Number(tick.c);
      const open = Number(tick.o);
      const changePct = open ? ((last - open) / open) * 100 : 0;

      // latest price
      setPrices((prev) => ({
        ...prev,
        [symbolKey]: {
          price: last,
          change: changePct,
        },
      }));

      // rolling sparkline buffer (max 24 points)
      setHistory((prev) => {
        const prevArr = prev[symbolKey] ?? [];
        const next = [...prevArr, last].slice(-24);

        return {
          ...prev,
          [symbolKey]: next,
        };
      });
    };

    ws.onerror = (err) => {
      console.error("Market WS error:", err);
    };

    return () => ws.close();
  }, [data]);

  if (isLoading) return <div>Loading markets...</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-white">
        Choose a Cryptocurrency to Start Trading
      </h1>

      {data.pairs.map((pair: MarketPair) => (
        <MarketRow
          key={pair.id}
          pair={pair}
          live={prices[pair.wsSymbol]}
          history={history[pair.wsSymbol]}
          onClick={() => navigate(`/market/${pair.id}`)}
        />
      ))}
    </div>
  );
};

export default MarketPairs;
