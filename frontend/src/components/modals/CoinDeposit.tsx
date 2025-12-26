import React, { useMemo, useState } from "react";
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
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateData } from "@/hooks/use-api";
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

  const { mutate, isPending } = useCreateData(COINS.DEPOSIT, [
    "coin_deposit",
  ]);

  /** ✅ Single source of truth */
  const selectedWallet = useMemo(() => {
    return assets?.find((w) => w.walletId === walletId);
  }, [assets, walletId]);

  const handleCopy = () => {
    if (!selectedWallet) return;
    navigator.clipboard.writeText(
      selectedWallet.address || selectedWallet.contractAddress
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

    mutate(
      {
        walletId, // ✅ dynamic & correct
        amount: Number(amount),
      },
      {
        onSuccess: () => {
          toast({
            title: "Deposit submitted",
            description: `${selectedWallet.coin.symbol} deposit pending approval`,
          });
          refetch();
          setAddCoinOpen(false);
          setWalletId("");
          setAmount("");
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
      }
    );
  };

  return (
    <Dialog open={addCoinOpen} onOpenChange={setAddCoinOpen}>
      <DialogContent>
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
                  <SelectItem
                    key={wallet.walletId}
                    value={wallet.walletId}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={wallet.coin?.iconUrl}
                        className="w-5 h-5"
                        alt={wallet.coin?.symbol}
                      />
                      <span className="font-medium">
                        {wallet.coin?.symbol}
                      </span>
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
              {/* Amount */}
              <div className="space-y-2">
                <Label>Deposit Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={
                      selectedWallet.address ||
                      selectedWallet.contractAddress
                    }
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                  >
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
                    Scan to deposit {selectedWallet.coin.symbol}
                  </p>
                </div>
              )}

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
                  disabled={isPending}
                >
                  {isPending ? "Depositing..." : "Deposit"}
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
