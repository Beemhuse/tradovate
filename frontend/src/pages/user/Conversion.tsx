import { useState, useEffect, useMemo } from "react";
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
import { ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useConversion } from "@/hooks/useConversion";
import { useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";

type ViewMode = "single" | "portfolio";

const CurrencyConversion = () => {
  const { toast } = useToast();

  /* -------------------- STATE -------------------- */
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [fromCoinId, setFromCoinId] = useState<string>("");
  const [toCoinId, setToCoinId] = useState<string>("");
  const [amount, setAmount] = useState("");

  /* -------------------- DATA -------------------- */
  const { data: coinsData } = useFetchData(COINS.COINLIST, "coin_list");
  const { data: assetsData, refetch: refetchAssets } = useFetchData(
    COINS.ASSETS,
    "assets"
  );

  const coins = useMemo(() => {
    return (coinsData?.coins || coinsData?.data || []).map((c: any) => ({
      id: c.id,
      symbol: c.symbol,
      icon: c.iconUrl,
    }));
  }, [coinsData]);

  /* -------------------- DEFAULT TARGET (USDT) -------------------- */
  useEffect(() => {
    if (!toCoinId && coins.length) {
      const usdt = coins.find((c) => c.symbol === "USDT");
      if (usdt) setToCoinId(usdt.id);
    }
  }, [coins, toCoinId]);

  /* -------------------- CONVERSION HOOK -------------------- */
  const {
    result,
    isLoading,
    error,
    convertCoin,
    executeConversion,
  } = useConversion();

  /* -------------------- HELPERS -------------------- */
  const getSymbol = (coinId?: string) =>
    coins.find((c) => c.id === coinId)?.symbol || "";

  const toggleMode = () => {
    setViewMode((prev) => (prev === "single" ? "portfolio" : "single"));

    // When switching back to portfolio, refresh preview
    if (viewMode === "single" && toCoinId) {
      convertCoin(undefined, toCoinId);
    }
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    // Auto-load portfolio preview
    if (viewMode === "portfolio" && toCoinId) {
      convertCoin(undefined, toCoinId);
    }
  }, [viewMode, toCoinId, convertCoin]);

  /* -------------------- ACTIONS -------------------- */
  const handlePreview = () => {
    if (!fromCoinId || !toCoinId || Number(amount) <= 0) return;
    convertCoin(fromCoinId, toCoinId, Number(amount));
  };

  const handleExecute = async () => {
    if (!fromCoinId || !toCoinId || Number(amount) <= 0) return;

    const res = await executeConversion({
      fromCoinId,
      toCoinId,
      amount: Number(amount),
    });

    if (res.success) {
      toast({
        title: "Conversion Successful",
        description: "Your assets were converted successfully.",
      });

      setAmount("");
      refetchAssets();
      convertCoin(undefined, toCoinId);
    } else {
      toast({
        title: "Conversion Failed",
        description: res.error || "Unable to execute conversion",
        variant: "destructive",
      });
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <UserNav />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Currency Conversion</h1>
            <p className="text-muted-foreground">
              Convert cryptocurrencies using live market prices
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

        {/* ===================== SINGLE CONVERSION ===================== */}
        {viewMode === "single" && (
          <Card>
            <CardHeader>
              <CardTitle>Convert Single Coin</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* FROM */}
                <div className="space-y-4">
                  <Label>From Coin</Label>
                  <Select value={fromCoinId} onValueChange={setFromCoinId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {coins.map((coin) => (
                        <SelectItem key={coin.id} value={coin.id}>
                          <div className="flex items-center gap-2">
                            <img src={coin.icon} className="w-5 h-5" />
                            {coin.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    placeholder="0.00"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* TO */}
                <div className="space-y-4">
                  <Label>To Coin</Label>
                  <Select value={toCoinId} onValueChange={setToCoinId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coins.map((coin) => (
                        <SelectItem key={coin.id} value={coin.id}>
                          <div className="flex items-center gap-2">
                            <img src={coin.icon} className="w-5 h-5" />
                            {coin.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-col gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={isLoading}
                    >
                      {isLoading ? "Calculating..." : "Preview Conversion"}
                    </Button>

                    {result?.mode === "single" && (
                      <Button onClick={handleExecute} disabled={isLoading}>
                        Execute Conversion
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

              {result?.mode === "single" && (
                <div className="bg-secondary/50 p-4 rounded">
                  <p className="text-sm text-muted-foreground">
                    You will receive
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {result.convertedAmount?.toFixed(8)}{" "}
                    {getSymbol(result.toCoinId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rate: 1 {getSymbol(result.fromCoinId)} ={" "}
                    {result.conversionRate?.toFixed(8)}{" "}
                    {getSymbol(result.toCoinId)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===================== PORTFOLIO ===================== */}
        {viewMode === "portfolio" && (
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>
                Portfolio Value in {getSymbol(toCoinId)}
              </CardTitle>

              <Select value={toCoinId} onValueChange={setToCoinId}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      {coin.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <p className="text-center py-8">Loading portfolio...</p>
              ) : error ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded">
                  {error}
                </div>
              ) : result?.mode === "portfolio" ? (
                <>
                  <div className="mb-6">
                    <p className="text-muted-foreground">
                      Total Portfolio Value
                    </p>
                    <p className="text-4xl font-bold">
                      {result.totalValue?.toLocaleString()}{" "}
                      {getSymbol(toCoinId)}
                    </p>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Coin</th>
                        <th className="text-right py-2">Balance</th>
                        <th className="text-right py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.wallets?.map((w) => (
                        <tr key={w.walletId} className="border-b">
                          <td className="py-2">
                            {getSymbol(w.coinId)}
                          </td>
                          <td className="text-right py-2">
                            {w.balance.toFixed(8)}
                          </td>
                          <td className="text-right py-2">
                            {w.convertedAmount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
