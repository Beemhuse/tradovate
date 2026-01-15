import TradingViewChart from "@/components/TradingViewChart";
import { Card, CardContent } from "@/components/ui/card";
import { MARKET_PAIR } from "@/hooks/apiEndpoint";
import { useFetchData } from "@/hooks/use-api";
import { useSearchParams } from "react-router-dom";

type MarketPair = {
  id: string;
  baseCoinId: string; // "BTC/USDT"
  symbol: string; // "BTC/USDT"
  wsSymbol: string; // "btcusdt"
  networkId: string;
};

const Market = () => {
  
  const [searchParams] = useSearchParams();

  const pairId = searchParams.get("pair");
  
  /** 1️⃣ Fetch pair from backend */
  const { data, isLoading, error } = useFetchData<{
    success: boolean;
    pair: MarketPair;
  }>(MARKET_PAIR.GET_PAIR(pairId), "market-pair");


  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
        <Card className="h-full border-gray-800 bg-black/50">
          <CardContent className="p-0 h-full">
            <TradingViewChart
              symbol={data?.pair?.wsSymbol.toUpperCase() || "BTCUSDT"}
              studies={[]}
              hideSideToolbar={false}
              hideVolume={true}
              height={600}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;
