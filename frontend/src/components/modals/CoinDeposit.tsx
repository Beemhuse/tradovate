import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateData, useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";

interface CoinDepositProps {
  addCoinOpen: boolean;
  setAddCoinOpen: (open: boolean) => void;
  assets: any[]; // wallets
  refetch: () => void;
  isLoading: boolean;
}

const CoinDeposit = ({
  addCoinOpen,
  setAddCoinOpen,
  assets,
  refetch,
  isLoading,
}: CoinDepositProps) => {
  const { toast } = useToast();

  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [enableConversion, setEnableConversion] = useState(false);
  const [fromCoinId, setFromCoinId] = useState<string>("");
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);

  const { data: coinsData } = useFetchData(COINS.COINLIST, "coin_list");
  const coinList = coinsData?.data || coinsData?.coins || [];

  const { mutate, isPending } = useCreateData(
    COINS.DEPOSIT,
    ["coin_deposit"],
    true,
  );

  /** ✅ Single source of truth */
  const selectedWallet = useMemo(() => {
    return assets?.find((w) => w.walletId === walletId);
  }, [assets, walletId]);

  const selectedDepositCoin = useMemo(() => {
    return coinList?.find((c: any) => c.id === fromCoinId);
  }, [coinList, fromCoinId]);

  // Fetch conversion when amount or coins change
  useEffect(() => {
    if (
      enableConversion &&
      fromCoinId &&
      walletId &&
      Number(amount) > 0 &&
      selectedDepositCoin &&
      selectedWallet
    ) {
      const fetchConversion = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BASE_URL || "http://localhost:9991/api/v1"}/market/conversion?coinId=${fromCoinId}&toCoinId=${selectedWallet.coinId}&amount=${amount}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
              },
            },
          );
          const data = await response.json();
          if (data.success && data.mode === "single") {
            setConversionRate(data.conversionRate);
            setConvertedAmount(data.convertedAmount);
          }
        } catch (err) {
          console.error("Conversion fetch error:", err);
        }
      };

      fetchConversion();
    }
  }, [
    enableConversion,
    fromCoinId,
    walletId,
    amount,
    selectedDepositCoin,
    selectedWallet,
  ]);

  const handleCopy = () => {
    if (!selectedWallet) return;
    navigator.clipboard.writeText(
      selectedWallet.address || selectedWallet.contractAddress,
    );
    toast({ title: "Address copied" });
  };

  const handleDeposit = () => {
    if (!walletId || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    const payload = new FormData();
    payload.append("walletId", walletId);
    payload.append("amount", amount);
    if (receipt) {
      payload.append("receipt", receipt);
    }

    // Add conversion details if enabled
    if (
      enableConversion &&
      fromCoinId &&
      selectedWallet &&
      fromCoinId !== selectedWallet.coinId
    ) {
      payload.append("fromCoinId", fromCoinId);
      payload.append("toCoinId", selectedWallet.coinId);
    }

    mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Deposit submitted",
          description: `${selectedWallet.coin.symbol} deposit pending approval`,
        });
        refetch();
        setAddCoinOpen(false);
        setWalletId("");
        setAmount("");
        setEnableConversion(false);
        setFromCoinId("");
        setConversionRate(null);
        setConvertedAmount(null);
        setReceipt(null);
      },
      onError: (err: any) => {
        toast({
          title: "Deposit failed",
          description:
            err?.response?.data?.error ||
            err?.message ||
            "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={addCoinOpen} onOpenChange={setAddCoinOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar">
        <DialogHeader>
          <DialogTitle>Deposit Coin</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Wallet selector */}
          <div className="space-y-2">
            <Label>Select Wallet</Label>
            <Select value={walletId} onValueChange={setWalletId}>
              <SelectTrigger>
                <SelectValue placeholder="Select coin wallet" />
              </SelectTrigger>
              <SelectContent>
                {assets?.map((wallet) => (
                  <SelectItem key={wallet.walletId} value={wallet.walletId}>
                    <div className="flex items-center gap-2">
                      <img
                        src={wallet.coin?.iconUrl}
                        className="w-5 h-5"
                        alt={wallet.coin?.symbol}
                      />
                      <span className="font-medium">{wallet.coin?.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        ({wallet.network?.name})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWallet && (
            <>
              {/* Conversion Toggle */}
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="enableConversion"
                  checked={enableConversion}
                  onChange={(e) => setEnableConversion(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="enableConversion"
                  className="cursor-pointer text-sm"
                >
                  Convert from another coin?
                </Label>
              </div>

              {/* Conversion Currency Selector */}
              {enableConversion && (
                <div className="space-y-2 border-l-2 border-primary/30 pl-3">
                  <Label>Deposit with</Label>
                  <Select value={fromCoinId} onValueChange={setFromCoinId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source coin" />
                    </SelectTrigger>
                    <SelectContent>
                      {coinList?.map((coin: any) => (
                        <SelectItem key={coin.id} value={coin.id}>
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
              )}

              {/* Address */}
              <div className="space-y-2">
                <Label>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={
                      selectedWallet.address || selectedWallet.contractAddress
                    }
                    className="font-mono text-sm"
                  />
                  <Button size="icon" variant="outline" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label>Amount to Deposit</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label>Upload Receipt (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                />
                {receipt && (
                  <p className="text-xs text-primary font-medium">
                    Selected: {receipt.name}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setAddCoinOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-full"
                  onClick={handleDeposit}
                  disabled={
                    isPending || !amount || (enableConversion && !fromCoinId)
                  }
                >
                  {isPending ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoinDeposit;
