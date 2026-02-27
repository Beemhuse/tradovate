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
import { useCryptoPrice } from "@/hooks/useCryptoPrice";

type ViewMode = "single" | "portfolio";

const CurrencyConversion = () => {
  const { toast } = useToast();

  /* -------------------- STATE -------------------- */
  const [viewMode, setViewMode] = useState<ViewMode>("portfolio");
  const [fromCoinId, setFromCoinId] = useState("");
  const [toCoinId, setToCoinId] = useState("");
  const [amount, setAmount] = useState("");

  /* -------------------- DATA -------------------- */
  const {
    data: assetData,
    refetch,
    isLoading: isAssetsLoading,
  } = useFetchData(COINS.ASSETS, "assets");

  const assets = assetData?.assets;
  const userCoins = useMemo(() => {
    if (!assets) return [];
    return assets.map((a: any) => ({
      id: a.walletId,
      coinId: a.coin?.id,
      symbol: a.coin?.symbol,
      icon: a.coin?.iconUrl,
      balance: a.balance,
      networkName: a.network?.name,
      networkIcon: a.network?.icon,
      address: a.address || a.contractAddress,
    }));
  }, [assets]);

  /* -------------------- DEFAULT TARGET (USDT) -------------------- */
  useEffect(() => {
    const fromCoin = userCoins.find((c) => c.id === fromCoinId);
    const toCoin = userCoins.find((c) => c.id === toCoinId);

    if ((!toCoinId || toCoin?.coinId === fromCoin?.coinId) && userCoins.length) {
      const usdt = userCoins.find((c) => c.symbol === "USDT" && c.coinId !== fromCoin?.coinId);
      if (usdt) {
        setToCoinId(usdt.id);
      } else {
        const firstValid = userCoins.find((c) => c.coinId !== fromCoin?.coinId);
        if (firstValid) setToCoinId(firstValid.id);
      }
    }
  }, [userCoins, toCoinId, fromCoinId]);

  /* -------------------- CONVERSION HOOK -------------------- */
  const { result, isLoading, error, convertCoin, executeConversion } =
    useConversion();

  /* -------------------- HELPERS -------------------- */
  const getSymbol = (coinId?: string) =>
    userCoins.find((c) => c.id === coinId)?.symbol || "";

  const toggleMode = () => {
    setViewMode((prev) => (prev === "single" ? "portfolio" : "single"));
  };

  /* -------------------- EFFECTS -------------------- */
  useEffect(() => {
    if (viewMode === "portfolio") {
      // Portfolio view does NOT need conversion preview,
      // but we keep this to sync backend state if needed
      convertCoin();
    }
  }, [viewMode, convertCoin]);

  /* -------------------- ACTIONS -------------------- */
  const handlePreview = () => {
    if (
      !fromCoinId ||
      !toCoinId ||
      Number(amount) <= 0 ||
      fromCoinId === toCoinId
    )
      return;

    const fromCoin = userCoins.find((c) => c.id === fromCoinId);
    const toCoin = userCoins.find((c) => c.id === toCoinId);

    if (fromCoin && Number(amount) > Number(fromCoin.balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${fromCoin.balance} ${fromCoin.symbol}`,
        variant: "destructive",
      });
      return;
    }

    convertCoin(fromCoin?.coinId, toCoin?.coinId, Number(amount));
  };
  const coinSymbols = assets?.map((c) => c?.coin?.symbol) || [];
  const prices = useCryptoPrice(coinSymbols);
  const calculateUSDTValue = (symbol: string, balance: number) => {
    if (symbol === "USDT") return balance;
    const price = parseFloat(prices[symbol]?.price || "0");
    return balance * price;
  };
  const handleExecute = async () => {
    if (
      !fromCoinId ||
      !toCoinId ||
      Number(amount) <= 0 ||
      fromCoinId === toCoinId
    )
      return;

    const fromCoin = userCoins.find((c) => c.id === fromCoinId);
    const toCoin = userCoins.find((c) => c.id === toCoinId);

    if (fromCoin && Number(amount) > Number(fromCoin.balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${fromCoin.balance} ${fromCoin.symbol}`,
        variant: "destructive",
      });
      return;
    }

    const res = await executeConversion({
      fromCoinId: fromCoin?.coinId || "",
      toCoinId: toCoin?.coinId || "",
      amount: Number(amount),
    });

    if (res.success) {
      toast({
        title: "Conversion Successful",
        description: "Funds moved successfully between wallets.",
      });

      setAmount("");
      refetch();
      convertCoin();
    } else {
      toast({
        title: "Conversion Failed",
        description: res.error || "Unable to move funds",
        variant: "destructive",
      });
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wallet Conversion</h1>
            <p className="text-muted-foreground">
              Swap funds between your wallets using real-time market prices
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="flex items-center gap-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            {viewMode === "single" ? "View Wallets" : "Convert Funds"}
          </Button>
        </div>

        {/* ===================== SINGLE CONVERSION ===================== */}
        {viewMode === "single" && (
          <Card>
            <CardHeader>
              <CardTitle>Move Funds</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* FROM */}
                <div className="space-y-4">
                  <Label>From Wallet</Label>
                  <Select value={fromCoinId} onValueChange={setFromCoinId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {userCoins.map((coin) => (
                        <SelectItem key={coin.id} value={coin.id}>
                          <div className="flex items-center gap-2">
                            <img src={coin.icon} className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              {coin.symbol}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fromCoinId && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        Available: {userCoins.find((c) => c.id === fromCoinId)?.balance || 0}{" "}
                        {getSymbol(fromCoinId)}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        {userCoins.find((c) => c.id === fromCoinId)?.networkName}
                      </p>
                    </div>
                  )}

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
                  <Label>To Wallet</Label>
                  <Select value={toCoinId} onValueChange={setToCoinId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {userCoins
                        .filter((coin) => {
                          const selectedFrom = userCoins.find(c => c.id === fromCoinId);
                          return coin.coinId !== selectedFrom?.coinId;
                        })
                        .map((coin) => (
                          <SelectItem key={coin.id} value={coin.id}>
                            <div className="flex items-center gap-2">
                              <img src={coin.icon} className="w-5 h-5" />
                              <span className="text-sm font-medium">
                                {coin.symbol}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {toCoinId && (
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        Available: {userCoins.find((c) => c.id === toCoinId)?.balance || 0}{" "}
                        {getSymbol(toCoinId)}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium uppercase">
                        {userCoins.find((c) => c.id === toCoinId)?.networkName}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={isLoading}
                    >
                      Preview Transfer
                    </Button>

                    {result?.mode === "single" && (
                      <Button onClick={handleExecute} disabled={isLoading}>
                        Confirm Transfer
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded">
                  {error}
                </div>
              )} */}

              {result?.mode === "single" && (
                <div className="bg-secondary/50 p-4 rounded">
                  <p className="text-sm text-muted-foreground">
                    You are about to move
                  </p>
                  <p className="text-2xl font-bold">
                    {amount} {getSymbol(fromCoinId)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    → {result.convertedAmount?.toFixed(8)} {getSymbol(toCoinId)}
                  </p>
                  {/* <p className="text-xs text-muted-foreground mt-2 italic">
                    Rate: 1 {getSymbol(fromCoinId)} ={" "}
                    {result.conversionRate?.toFixed(8)} {getSymbol(toCoinId)}
                  </p> */}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===================== PORTFOLIO ===================== */}
        {viewMode === "portfolio" && (
          <Card>
            <CardHeader>
              <CardTitle>My Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Coin</th>
                      <th className="text-left py-3 px-4">Network</th>
                      <th className="text-right py-3 px-4">Available</th>
                      <th className="text-right py-3 px-4">Frozen</th>
                      <th className="text-right py-3 px-4">USDT Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets?.map((wallet, index) => {
                      const symbol = wallet.coin?.symbol || "";
                      // coupon_code: appliedCoupon?.code || null,
                      const usdtValue = calculateUSDTValue(
                        symbol,
                        Number(wallet.balance),
                      );
                      return (
                        <tr
                          key={wallet.coinId + `${index}`}
                          className="border-b border-border hover:bg-secondary/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 border border-border rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                {wallet.coin?.iconUrl ? (
                                  <img
                                    src={wallet.coin.iconUrl}
                                    alt={symbol}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-primary font-bold">
                                    {symbol[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {wallet.coin?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {symbol}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {wallet.network ? (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  {wallet.network.icon && (
                                    <img
                                      src={wallet.network.icon}
                                      alt={wallet.network.name}
                                      className="h-4 w-4"
                                    />
                                  )}
                                  <span className="text-sm font-medium">
                                    {wallet.network.name}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground uppercase">
                                  {wallet.network.type || "Mainnet"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="text-right py-4 px-4 font-mono">
                            {Number(wallet.balance).toFixed(2)}
                          </td>
                          {/* <td className="text-right py-4 px-4 font-mono text-muted-foreground">
                          {showBalance
                            ? Number(wallet.locked_balance)
                              ? Number(wallet.locked_balance).toFixed(8)
                              : "0.0"
                            : "••••"}
                        </td> */}
                          <td className="text-right py-4 px-4 font-semibold text-success">
                            {/* {showBalance ? `$${usdtValue.toFixed(2)}` : "••••••"} */}
                            {/* {showBalance
                            ? `$${Number(wallet.balance)}`
                            : "••••••"} */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurrencyConversion;
