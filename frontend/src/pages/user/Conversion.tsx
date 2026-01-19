import { useState, useEffect } from "react";
import UserNav from "@/components/layout/UserNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConversion } from "@/hooks/useConversion";
import { useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";
import { ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CurrencyConversion = () => {
  const [toSymbol, setToSymbol] = useState("USDT");
  const [fromSymbol, setFromSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [viewMode, setViewMode] = useState<"single" | "portfolio">("portfolio");

  const { convertCoin, executeConversion, result, isLoading, error } =
    useConversion();
  const { data: coinsData } = useFetchData(COINS.COINLIST, "coin_list");
  const { data: assetsData, refetch: refetchAssets } = useFetchData(
    COINS.ASSETS,
    "assets",
  );
  const { toast } = useToast();

  const coinList = coinsData?.data || coinsData?.coins || [];
  const assets = assetsData?.assets || [];

  useEffect(() => {
    // Auto-fetch portfolio conversion when component loads
    convertCoin(undefined, toSymbol, undefined);
  }, [toSymbol, convertCoin]);

  const handleSingleConversion = () => {
    if (fromSymbol && amount && Number(amount) > 0) {
      convertCoin(fromSymbol, toSymbol, Number(amount));
    }
  };

  const handleExecuteConversion = async () => {
    if (!fromSymbol || !toSymbol || !amount || Number(amount) <= 0) return;

    const res = await executeConversion(fromSymbol, toSymbol, Number(amount));
    if (res.success) {
      toast({
        title: "Conversion Successful",
        description: `Successfully converted ${amount} ${fromSymbol} to ${toSymbol}`,
      });
      setAmount("");
      refetchAssets();
      // Optionally refresh portfolio
      convertCoin(undefined, toSymbol, undefined);
    } else {
      toast({
        title: "Conversion Failed",
        description: res.error || "Failed to execute conversion",
        variant: "destructive",
      });
    }
  };

  const handlePortfolioConversion = () => {
    convertCoin(undefined, toSymbol, undefined);
  };

  const toggleMode = () => {
    setViewMode(viewMode === "single" ? "portfolio" : "single");
    if (viewMode === "single") {
      handlePortfolioConversion();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <UserNav />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Currency Conversion</h1>
            <p className="text-muted-foreground">
              Convert between different cryptocurrencies at current market rates
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            {viewMode === "single" ? "View Portfolio" : "Single Coin"}
          </Button>
        </div>

        {/* Single Coin Conversion */}
        {viewMode === "single" && (
          <Card className="crypto-glow">
            <CardHeader>
              <CardTitle>Convert Single Coin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* From Section */}
                <div className="space-y-4">
                  <div>
                    <Label>From Coin</Label>
                    <Select value={fromSymbol} onValueChange={setFromSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source coin" />
                      </SelectTrigger>
                      <SelectContent>
                        {coinList?.map((coin: any) => (
                          <SelectItem key={coin.id} value={coin.symbol}>
                            <div className="flex items-center gap-2">
                              <img
                                src={coin?.iconUrl}
                                className="w-5 h-5"
                                alt={coin.symbol}
                              />
                              <span>{coin.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* To Section */}
                <div className="space-y-4">
                  <div>
                    <Label>To Coin</Label>
                    <Select value={toSymbol} onValueChange={setToSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target coin" />
                      </SelectTrigger>
                      <SelectContent>
                        {coinList?.map((coin: any) => (
                          <SelectItem key={coin.id} value={coin.symbol}>
                            <div className="flex items-center gap-2">
                              <img
                                src={coin?.iconUrl}
                                className="w-5 h-5"
                                alt={coin.symbol}
                              />
                              <span>{coin.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleSingleConversion}
                      disabled={
                        isLoading ||
                        !fromSymbol ||
                        !amount ||
                        Number(amount) <= 0
                      }
                    >
                      {isLoading && !result
                        ? "Calculating..."
                        : "Preview Conversion"}
                    </Button>
                    {result && result.mode === "single" && (
                      <Button
                        className="w-full"
                        onClick={handleExecuteConversion}
                        disabled={isLoading}
                      >
                        {isLoading ? "Executing..." : "Execute Conversion"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded">
                  {error}
                </div>
              )}

              {result && result.mode === "single" && (
                <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        From Price
                      </p>
                      <p className="text-lg font-semibold">
                        ${result.fromPrice?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">To Price</p>
                      <p className="text-lg font-semibold">
                        ${result.toPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      You will receive
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {result.convertedAmount?.toFixed(8)} {result.to}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate: 1 {result.from} ={" "}
                      {result.conversionRate?.toFixed(8)} {result.to}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio Conversion */}
        {viewMode === "portfolio" && (
          <Card className="crypto-glow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Portfolio Value in {toSymbol}</CardTitle>
              <div className="w-48">
                <Label className="text-sm">View in</Label>
                <Select value={toSymbol} onValueChange={setToSymbol}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coinList?.map((coin: any) => (
                      <SelectItem key={coin.id} value={coin.symbol}>
                        {coin.symbol}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <p className="text-center py-8">Loading portfolio data...</p>
              ) : error ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded">
                  {error}
                </div>
              ) : result && result.mode === "portfolio" ? (
                <>
                  <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 rounded-lg">
                    <p className="text-muted-foreground mb-2">
                      Total Portfolio Value
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      {result.totalValue?.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {result.base}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4">Coin</th>
                          <th className="text-right py-3 px-4">Balance</th>
                          <th className="text-right py-3 px-4">Price</th>
                          <th className="text-right py-3 px-4">
                            Conversion Rate
                          </th>
                          <th className="text-right py-3 px-4">
                            Value in {result.base}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.wallets?.map((wallet, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-border hover:bg-secondary/50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {assets?.find(
                                  (a: any) => a.walletId === wallet.walletId,
                                )?.coin?.iconUrl && (
                                  <img
                                    src={
                                      assets.find(
                                        (a: any) =>
                                          a.walletId === wallet.walletId,
                                      )?.coin?.iconUrl
                                    }
                                    className="w-6 h-6"
                                    alt={wallet.coin}
                                  />
                                )}
                                <span className="font-medium">
                                  {wallet.coin}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4 font-mono">
                              {wallet.balance.toFixed(8)}
                            </td>
                            <td className="text-right py-4 px-4 font-mono">
                              ${wallet.price.toFixed(2)}
                            </td>
                            <td className="text-right py-4 px-4 font-mono text-muted-foreground">
                              {wallet.conversionRate.toFixed(8)}
                            </td>
                            <td className="text-right py-4 px-4 font-semibold text-success">
                              {wallet.convertedAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurrencyConversion;
