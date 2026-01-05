import { useParams } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Card, CardContent } from "@/components/ui/card";
import TradingViewChart from "@/components/TradingViewChart";
import OrderPanel from "@/components/trade/orderPanel";
import { useFetchData } from "@/hooks/use-api";
import { useLivePrice } from "@/hooks/useLivePrice";
import { MARKET_PAIR, COINS } from "@/hooks/apiEndpoint";

type MarketPair = {
  id: string;
  baseCoinId: string; // "BTC/USDT"
  symbol: string; // "BTC/USDT"
  wsSymbol: string; // "btcusdt"
  networkId: string;
};

const TradePage = () => {
  const { id } = useParams<{ id: string }>();

  /** 1️⃣ Fetch pair from backend */
  const { data, isLoading, error } = useFetchData<{
    success: boolean;
    pair: MarketPair;
  }>(MARKET_PAIR.GET_PAIR(id), "market-pair");

  // Fetch user assets for balance
  const { data: assetData } = useFetchData(COINS.ASSETS, "assets");
  const assets = assetData?.assets || [];
  
  const pair: any = data?.pair;
  
  const usdtBalance =
    assets.find((a: any) => a.coin?.id === pair?.baseCoin?.id)?.balance || 0;


  /** 2️⃣ Live price via WebSocket */
  const livePrice = useLivePrice(pair?.wsSymbol?.toLowerCase() ?? "");

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
      <div className="container mx-auto px-4 py-8">
        <Card className="b-black">
          <CardContent className="flex flex-col md:flex-row gap-1 p-1">
            {/* 📊 TradingView chart (client-side only) */}
            <div className="flex-1 w-full md:w-1/2 lg:w-2/3">
              <TradingViewChart
                symbol={pair?.wsSymbol.toUpperCase()}
                height={550}
              />
            </div>

            {/* 🧾 Order panel */}
            <div className="w-full md:w-1/2 lg:w-1/3">
              <OrderPanel
                coinId={pair.baseCoinId}
                symbol={pair.symbol}
                networkId={pair.networkId}
                currentPrice={livePrice}
                availableBalance={Number(usdtBalance)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradePage;
