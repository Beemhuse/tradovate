import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import { useAuth } from "@/contexts/AuthContext";
import { useCoins } from "@/hooks/useCoins";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { data: coins } = useCoins();
  
  const featuredCoins = ["BTC", "ETH", "USDT"];
  const marketCoins = coins?.map((c) => c.symbol).filter((s) => s !== "USDT") || ["BTC", "ETH", "BNB", "SOL"];
  
  const featuredPrices = useCryptoPrice(featuredCoins);
  const marketPrices = useCryptoPrice(marketCoins);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const getCoinName = (symbol: string) => {
    const coin = coins?.find((c) => c.symbol === symbol);
    if (coin) return coin.name;
    const names: Record<string, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      USDT: "Tether",
      BNB: "BNB",
      SOL: "Solana",
    };
    return names[symbol] || symbol;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNav />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/wallet">
                  <ArrowDownToLine className="h-6 w-6" />
                  <span>Deposit</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/wallet">
                  <ArrowUpFromLine className="h-6 w-6" />
                  <span>Withdraw</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/market">
                  <DollarSign className="h-6 w-6" />
                  <span>Buy</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/market">
                  <Repeat className="h-6 w-6" />
                  <span>Convert</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Featured Markets */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Featured Markets</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredCoins.map((symbol) => {
              const priceData = featuredPrices[symbol];
              return (
                <Card key={symbol} className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{getCoinName(symbol)}</h3>
                        <p className="text-sm text-muted-foreground">{symbol}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{symbol[0]}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">${priceData?.price || "Loading..."}</p>
                      <p className={priceData?.positive ? "text-success" : "text-danger"}>
                        {priceData?.positive ? "+" : ""}{priceData?.changePercent24h}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Market Table */}
        <Card>
          <CardHeader>
            <CardTitle>Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Pair</th>
                    <th className="text-right py-3 px-4">Price</th>
                    <th className="text-right py-3 px-4">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {marketCoins.map((symbol) => {
                    const priceData = marketPrices[symbol];
                    return (
                      <tr
                        key={symbol}
                        className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => navigate("/contract")}
                      >
                        <td className="py-3 px-4 font-medium">{symbol}/USDT</td>
                        <td className="text-right py-3 px-4">${priceData?.price || "..."}</td>
                        <td className={`text-right py-3 px-4 ${priceData?.positive ? "text-success" : "text-danger"}`}>
                          {priceData?.positive ? "+" : ""}{priceData?.changePercent24h}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
