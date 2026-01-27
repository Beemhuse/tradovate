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
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: coinsData } = useFetchData(COINS.COINLIST, "coin_list");
  const coinList = coinsData?.data || coinsData?.coins || [];

  const { mutate, isPending } = useCreateData(COINS.DEPOSIT, ["coin_deposit"], true);

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
            `${import.meta.env.VITE_BASE_UR || "http://localhost:4001/api/v1"}/market/conversion?coin=${selectedDepositCoin.symbol}&to=${selectedWallet.coin.symbol}&amount=${amount}`,
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

    const formData = new FormData();
    formData.append("walletId", walletId);
    formData.append("amount", amount);
    if (receiptFile) {
      formData.append("receipt", receiptFile);
    }

    // Add conversion details if enabled
    if (
      enableConversion &&
      fromCoinId &&
      selectedWallet &&
      fromCoinId !== selectedWallet.coinId
    ) {
      formData.append("fromCoinId", fromCoinId);
      formData.append("toCoinId", selectedWallet.coinId);
    }

    mutate(formData, {
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
        setReceiptFile(null);
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

              {/* QR */}
              {selectedWallet.qrCode && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <img
                    src={selectedWallet.qrCode}
                    className="w-40 h-40 border rounded-md p-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Scan to deposit{" "}
                    {selectedDepositCoin?.symbol || selectedWallet.coin.symbol}
                  </p>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <Label>
                  {enableConversion && fromCoinId
                    ? "Deposit Amount"
                    : "Deposit Amount"}
                  {selectedDepositCoin
                    ? ` (${selectedDepositCoin.symbol})`
                    : ` (${selectedWallet.coin.symbol})`}
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                {enableConversion && convertedAmount && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <ArrowRightLeft className="h-3 w-3" />
                    You will receive:{" "}
                    <span className="font-semibold text-foreground">
                      {convertedAmount.toFixed(8)} {selectedWallet.coin.symbol}
                    </span>
                  </div>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <Label htmlFor="receipt">Upload Receipt</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
                <p className="text-[10px] text-muted-foreground">
                  Please upload a screenshot of your transaction proof.
                </p>
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
                    isPending ||
                    !amount ||
                    !receiptFile ||
                    (enableConversion && !fromCoinId)
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
