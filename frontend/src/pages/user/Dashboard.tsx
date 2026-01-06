import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  Repeat,
  ChartNoAxesCombined,
} from "lucide-react";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchData } from "@/hooks/use-api";
import { COINS, MARKET_PAIR } from "@/hooks/apiEndpoint";
import CoinDeposit from "@/components/modals/CoinDeposit";
import CoinWithdrawal from "@/components/modals/CoinWithdrawal";
import BankWithdrawal from "@/components/modals/BankWithdrawal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: userLoading } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankWithdrawOpen, setBankWithdrawOpen] = useState(false);

  const {
    data: assetData,
    refetch,
    isLoading,
  } = useFetchData(COINS.ASSETS, "assets");

  const assets = assetData?.assets;

  const {
    data: cryptoPairsData,
    isLoading: cryptoPairsLoading,
    error: cryptoPairsError,
  } = useFetchData(MARKET_PAIR.LIST, "market-pairs");

  const cryptoPairs = cryptoPairsData?.pairs || [];
  const baseCoins =
    cryptoPairs?.map((asset) => asset?.symbol?.split("/")[0]) || [];

  const prices = useCryptoPrice(baseCoins);

  useEffect(() => {
    if (!userLoading && !user) {
      navigate("/");
    }
  }, [user, userLoading, navigate]);

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...{" "}
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const sortAssets = assets?.sort((a, b) => b.balance - a.balance);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 gap-2 justify-start"
                onClick={() => setDepositOpen(true)}
              >
                <ArrowDownToLine className="h-6 w-6" />
                <span>Deposit</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-24 w-full gap-2 justify-start"
                  >
                    <ArrowUpFromLine className="h-6 w-6" />
                    <span>Withdraw</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setWithdrawOpen(true);
                      setBankWithdrawOpen(false);
                    }}  
                  >
                    Crypto Currency
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setBankWithdrawOpen(true);
                      setWithdrawOpen(false);
                    }}
                  >
                    Bank
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="h-24 gap-2 justify-start "
                onClick={() => navigate("/market")}
              >
                <Repeat className="h-6 w-6" />
                <span>Convert</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Featured Markets */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Featured Markets</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {sortAssets?.slice(0, 3).map((coin) => {
              // const priceData = featuredPrices[symbol];
              return (
                <Card
                  key={coin?.id}
                  className="hover:border-primary transition-colors cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">{coin?.coin?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {coin?.coin?.symbol}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {coin?.coin?.name[0]}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold">${Number(coin?.balance).toLocaleString()}</p>
                      <p className={true ? "text-success" : "text-danger"}>
                        +{2.01}%
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
                    <th className="text-left py-3 px-4">Trend</th>
                    <th className="text-center py-3 px-4">Price</th>
                    <th className="text-right py-3 px-4">24h Change</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptoPairs.map((pair) => {
                    const priceData = prices[pair?.symbol?.split("/")[0]];
                    return (
                      <tr
                        key={pair?.id}
                        className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                      // onClick={() => navigate("/contract")}
                      >
                        <td className="py-3 px-4 font-medium">
                          {priceData?.symbol}/USDT
                        </td>

                        <td
                          className={`text-left py-3 px-4 ${priceData?.positive ? "text-success" : "text-danger"
                            }`}
                        >
                          <ChartNoAxesCombined />
                        </td>
                        <td className="text-center py-3 px-4">
                          ${Number(priceData?.price).toLocaleString() || "..."}
                        </td>
                        <td
                          className={`text-right py-3 px-4 ${priceData?.positive ? "text-success" : "text-danger"
                            }`}
                        >
                          {priceData?.positive ? "+" : ""}
                          {priceData?.changePercent24h}%
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

      {/* Deposit Dialog */}
      <CoinDeposit
        addCoinOpen={depositOpen}
        setAddCoinOpen={setDepositOpen}
        assets={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

      {/* Withdraw Dialog */}
      <CoinWithdrawal
        withdrawOpen={withdrawOpen}
        setWithdrawOpen={setWithdrawOpen}
        coins={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

      {/* Bank Withdraw Dialog */}
      <BankWithdrawal
        withdrawOpen={bankWithdrawOpen}
        setWithdrawOpen={setBankWithdrawOpen}
        coins={assets}
        refetch={refetch}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
