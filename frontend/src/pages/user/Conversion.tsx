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
import { ArrowRightLeft, Loader2 } from "lucide-react";
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
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");

  /* -------------------- DATA -------------------- */
  const { data: coinsData } = useFetchData(COINS.COINLIST, "coin_list");
  const {
    data: assetData,
    refetch,
    isLoading: isAssetsLoading,
  } = useFetchData(COINS.ASSETS, "assets");

  const assets = assetData?.assets;
  const refetchAssets = refetch;
  const coins = useMemo(() => {
    return (coinsData?.coins || coinsData?.data || []).map((c: any) => ({
      id: c.id,
      symbol: c.symbol,
      icon: c.iconUrl,
    }));
  }, [coinsData]);

  /* -------------------- DEFAULT TARGET (USDT) -------------------- */
  useEffect(() => {
    if (!toWalletId && assets?.length) {
      // Find a USDT wallet if available, otherwise pick first non-from wallet
      const usdtWallet = assets.find((a: any) => a.coin.symbol === "USDT");
      if (usdtWallet && usdtWallet.walletId !== fromWalletId) {
        setToWalletId(usdtWallet.walletId);
      }
    }
  }, [assets, fromWalletId, toWalletId]);

  /* -------------------- CONVERSION HOOK -------------------- */
  const { result, isLoading, error, convertCoin, executeConversion } =
    useConversion();

  /* -------------------- HELPERS -------------------- */
  const getSymbolByWalletId = (walletId?: string) =>
    assets?.find((a: any) => a.walletId === walletId)?.coin?.symbol || "";

  const getWalletById = (walletId?: string) =>
    assets?.find((a: any) => a.walletId === walletId);

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
      !fromWalletId ||
      !toWalletId ||
      Number(amount) <= 0 ||
      fromWalletId === toWalletId
    )
      return;

    convertCoin(fromWalletId, toWalletId, Number(amount));
  };
  const coinSymbols = assets?.map((c) => c?.coin?.symbol) || [];
  const prices = useCryptoPrice(coinSymbols);
  const calculateUSDTValue = (symbol: string, balance: number) => {
    // 💡 In this platform, balance units ARE the USDT equivalent (1:1)
    return balance;
  };
  const handleExecute = async () => {
    if (
      !fromWalletId ||
      !toWalletId ||
      Number(amount) <= 0 ||
      fromWalletId === toWalletId
    )
      return;

    const res = await executeConversion({
      fromWalletId,
      toWalletId,
      amount: Number(amount),
    });

    if (res.success) {
      console.log("[Conversion] Success result:", res);
      const vb = (res as any).verifiedBalances;
      const vbStr = vb
        ? ` (New: ${fromWallet.coin.symbol}=${vb[fromWallet.coin.symbol]?.toFixed(2)}, ${toWallet.coin.symbol}=${vb[toWallet.coin.symbol]?.toFixed(2)})`
        : "";

      toast({
        title: "Conversion Successful" + (vb ? " ✅" : ""),
        description: `Funds moved successfully${vbStr}.`,
      });

      setAmount("");
      refetchAssets();
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
                  <Label>From Wallet (Source)</Label>
                  <Select value={fromWalletId} onValueChange={setFromWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets?.map((asset: any) => (
                        <SelectItem key={asset.walletId} value={asset.walletId}>
                          <div className="flex items-center gap-2">
                            <img src={asset.coin.iconUrl} className="w-5 h-5 rounded-full" />
                            <div className="flex flex-col">
                              <span className="font-medium">{asset.coin.symbol}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {asset.network?.name || "Mainnet"}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fromWalletId && (
                    <div className="flex justify-between text-sm px-1">
                      <span className="text-muted-foreground">Available balance:</span>
                      <span className="font-medium text-primary">
                        ${Number(getWalletById(fromWalletId)?.balance || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <Label>Amount to convert ($)</Label>
                  <Input
                    type="number"
                    value={amount}
                    placeholder="E.g. 500"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* TO */}
                <div className="space-y-4">
                  <Label>To Wallet (Destination)</Label>
                  <Select value={toWalletId} onValueChange={setToWalletId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets?.filter((a: any) => a.walletId !== fromWalletId).map((asset: any) => (
                        <SelectItem key={asset.walletId} value={asset.walletId}>
                          <div className="flex items-center gap-2">
                            <img src={asset.coin.iconUrl} className="w-5 h-5 rounded-full" />
                            <div className="flex flex-col">
                              <span className="font-medium">{asset.coin.symbol}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {asset.network?.name || "Mainnet"}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {toWalletId && (
                    <div className="flex justify-between text-sm px-1 mt-2">
                      <span className="text-muted-foreground">Target balance:</span>
                      <span className="font-medium text-success">
                        ${Number(getWalletById(toWalletId)?.balance || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={handlePreview}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Preview Transfer"
                      )}
                    </Button>

                    {result?.mode === "single" && (
                      <Button onClick={handleExecute} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          "Confirm Transfer"
                        )}
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
                    Transfer Details
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-muted-foreground">From Wallet:</span>{" "}
                      <span className="font-mono font-bold text-destructive">
                        -{Number(amount).toFixed(2)} {getSymbolByWalletId(fromWalletId)}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">To Wallet:</span>{" "}
                      <span className="font-mono font-bold text-success">
                        +{Number(amount).toFixed(2)} {getSymbolByWalletId(toWalletId)}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ===================== PORTFOLIO ===================== */}
        {viewMode === "portfolio" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Assets</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchAssets()}
                disabled={isAssetsLoading}
              >
                {isAssetsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
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
                            ${usdtValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
