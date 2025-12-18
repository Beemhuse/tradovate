import { useParams } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Card, CardContent } from "@/components/ui/card";
import TradingViewChart from "@/components/TradingViewChart";
import OrderPanel from "@/components/trade/orderPanel";
import { useFetchData } from "@/hooks/use-api";
import { useLivePrice } from "@/hooks/useLivePrice";

type MarketPair = {
  id: string;
  symbol: string; // "BTC/USDT"
  wsSymbol: string; // "btcusdt"
};

const Market = () => {
  const { id } = useParams<{ id: string }>();

  /** 1️⃣ Fetch pair from backend */
  const { data, isLoading, error } = useFetchData<{
    success: boolean;
    pair: MarketPair;
  }>(`/market/pairs/${id}`, "market-pair");

  const pair = data?.pair;

  /** 2️⃣ Live price via WebSocket */
  const livePrice = useLivePrice(pair?.wsSymbol?.toUpperCase() ?? "");

  if (isLoading) {
    return <div className="p-8 text-center">Loading market...</div>;
  }

  if (error || !pair) {
    return (
      <div className="p-8 text-center text-red-500">Failed to load market</div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNav />

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-0">
            {/* 📊 TradingView chart (client-side only) */}
            <TradingViewChart
              symbol={pair.wsSymbol.toUpperCase()}
              height={520}
            />

            {/* 🧾 Order panel */}
            <OrderPanel
              pairId={pair.id}
              symbol={pair.symbol}
              currentPrice={livePrice}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;
