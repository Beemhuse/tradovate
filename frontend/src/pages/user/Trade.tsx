import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, ArrowRight } from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";
import OrderPanel from "@/components/trade/orderPanel";
import { useFetchData } from "@/hooks/use-api";
import { useLivePrice } from "@/hooks/useLivePrice";
import { MARKET_PAIR, COINS } from "@/hooks/apiEndpoint";
import {
  OrdersSection,
  Order,
  OrderDetailsDialog,
} from "@/components/transactions";
import { useState, useMemo } from "react";

type MarketPair = {
  id: string;
  baseCoinId: string; // "BTC/USDT"
  symbol: string; // "BTC/USDT"
  wsSymbol: string; // "btcusdt"
  networkId: string;
};

const TradePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /** 1️⃣ Fetch pair from backend */
  const { data, isLoading, error } = useFetchData<{
    success: boolean;
    pair: MarketPair;
  }>(MARKET_PAIR.GET_PAIR(id), "market-pair");

  // Fetch orders data
  const { data: ordersData, isLoading: loadingOrders, refetch } = useFetchData<Order[]>(
    "/market/orders",
    ["user-orders"],
  );

  const recentOrders = useMemo(() => {
    if (!ordersData) return [];
    return [...ordersData].slice(0, 5);
  }, [ordersData]);

  // Fetch user assets for balance
  const { data: assetData } = useFetchData(COINS.ASSETS, "assets");
  const assets = assetData?.assets || [];

  const pair: any = data?.pair;

  console.log("pair", pair);
  console.log("pairassets", assets);

  const BaseCoinBalance =
    assets.find((a: any) => a.coin?.id === pair?.baseCoin?.id && a.network?.id === pair?.networkId)?.balance || 0;

  const USDTBalance =
    assets.find((a: any) => a.coin?.id === pair?.quoteCoin?.id && a.network?.id === pair?.networkId)?.balance || 0;

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
      <div className="container mx-auto px-4 py-8 space-y-2">
        <Card className="border-border">
          <CardContent className="flex flex-col md:flex-row gap-1 p-1">
            {/* 📊 TradingView chart (client-side only) */}
            <div className="flex-1 w-full md:w-1/2 lg:w-2/3 h-full">
              <TradingViewChart
                symbol={pair?.wsSymbol.toUpperCase()}
                height={620}
              />
            </div>

            {/* 🧾 Order panel */}
            <div className="w-full md:w-1/2 lg:w-1/3">
              <OrderPanel
                marketPairId={pair.id}
                symbol={pair.symbol}
                networkType={pair.network?.type}
                currentPrice={livePrice}
                availableBalance={Number(BaseCoinBalance)}
                USDTBalance={Number(USDTBalance)}
                refetch={refetch}
              />
            </div>
          </CardContent>
        </Card>

        {/* 📜 Trade History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Trades
              </CardTitle>
              <CardDescription>Your last 5 trading activities</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/transactions")}
              className="gap-2"
            >
              View All History
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <OrdersSection
              orders={recentOrders}
              filters={{}}
              isLoading={loadingOrders}
              onOrderClick={setSelectedOrder}
            />
          </CardContent>
        </Card>
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default TradePage;
