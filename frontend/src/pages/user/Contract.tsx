import UserNav from "@/components/layout/UserNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartNoAxesCombined } from "lucide-react";
import { useState, useEffect } from "react";
import TradingViewChart from "@/components/TradingViewChart";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import { useToast } from "@/hooks/use-toast";
import { useFetchData } from "@/hooks/use-api";
import { COINS, MARKET_PAIR } from "@/hooks/apiEndpoint";
import { useNavigate } from "react-router-dom";

const Contract = () => {
  const navigate = useNavigate();
  // const { toast } = useToast();

  // const filteredAssets = assets?.filter((asset) => asset?.balance > 0) || [];
  const { data, isLoading, error } = useFetchData(
    MARKET_PAIR.LIST,
    "market-pairs"
  );

  // const coins = filteredAssets?.map((asset) => asset?.coin?.symbol);
  const cryptoPairs = data?.pairs || [];
  const coins = cryptoPairs?.map((asset) => asset?.symbol?.split("/")[0]) || [];

  const prices = useCryptoPrice(coins);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...{" "}
      </div>
    );
  }

  // console.log("data", data);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contract Trading</h1>
          <p className="text-muted-foreground">
            Predict market direction and earn profits in seconds
          </p>
        </div>

        {/* Coin Selection */}
        <div className="w-full gap-4">
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
                          onClick={() => navigate(`/contract/${pair?.id}`)}
                        >
                          <td className="py-3 flex gap-4 px-4 font-medium">
                            <p>

                            {priceData?.symbol}/USDT
                            </p>
                            <p>

                            ({pair?.network?.type})
                            </p>
                          </td>

                          <td
                            className={`text-left py-3 px-4 ${
                              priceData?.positive
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            <ChartNoAxesCombined />
                          </td>
                          <td className="text-center py-3 px-4">
                            ${priceData?.price || "..."}
                          </td>
                          <td
                            className={`text-right py-3 px-4 ${
                              priceData?.positive
                                ? "text-success"
                                : "text-danger"
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
      </div>
    </div>
  );
};

export default Contract;
