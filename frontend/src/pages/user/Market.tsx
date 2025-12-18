import UserNav from "@/components/layout/UserNav";
import { Card, CardContent } from "@/components/ui/card";
import TradingViewChart from "@/components/TradingViewChart";

const Market = () => {
  return (
    <div className="min-h-screen bg-background">
      <UserNav />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-0">
            <TradingViewChart symbol="BTCUSDT" height={600} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Market;
