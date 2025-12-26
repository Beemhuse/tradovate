import UserNav from "@/components/layout/UserNav";
import TradingViewChart from "@/components/TradingViewChart";
import { Card, CardContent } from "@/components/ui/card";

const Market = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
        <Card className="h-full border-gray-800 bg-black/50">
          <CardContent className="p-0 h-full">
            <TradingViewChart
              symbol="BTCUSDT"
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
