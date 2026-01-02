import React, { useEffect, useMemo, useState } from "react";
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
import { useCreateData, useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";

interface AddCoinsProps {
  addCoinOpen: boolean;
  setAddCoinOpen: (open: boolean) => void;
  assets: any[];
  refetch: () => void;
  isLoading: boolean;
}

const AddCoins = ({
  addCoinOpen,
  setAddCoinOpen,
  assets,
  refetch,
  isLoading,
}: AddCoinsProps) => {
  const { toast } = useToast();

  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [networkEntryId, setNetworkEntryId] = useState("");
  const [amount, setAmount] = useState("");
  const [isDeposit, setIsDeposit] = useState(false);

const { data: coinResponse } = useFetchData(COINS.COINLIST, "coin_list");

const coinList = coinResponse?.coins ?? [];

  const { mutate: createWallet, isPending: creatingWallet } =
    useCreateData(COINS.CREATE, ["create_coin"]);

  const { mutate: depositCoin, isPending: depositing } =
    useCreateData(COINS.DEPOSIT, ["coin_deposit"]);

  /**
   * Selected Coin
   */
  const selectedCoin = useMemo(
    () => coinList?.find((c) => c.id === selectedCoinId),
    [coinList, selectedCoinId]
  );

  /**
   * Selected Network Entry (wallet-network mapping)
   */
  const selectedNetwork = useMemo(() => {
    return selectedCoin?.networks?.find(
      (n: any) => n.id === networkEntryId
    );
  }, [selectedCoin, networkEntryId]);

  /**
   * Existing Wallet (if any)
   */
  const existingWallet = useMemo(() => {
    return assets?.find(
      (w) =>
        w.coinId === selectedCoinId &&
        w.networkId === selectedNetwork?.network?.id
    );
  }, [assets, selectedCoinId, selectedNetwork]);

  /**
   * Reset dependent state
   */
  useEffect(() => {
    setNetworkEntryId("");
    setIsDeposit(false);
    setAmount("");
  }, [selectedCoinId]);

  /**
   * Create wallet
   */
  const handleCreateWallet = () => {
    if (!selectedCoin || !selectedNetwork) return;

    createWallet(
      {
        coinId: selectedCoin.id,
        networkId: selectedNetwork.network.id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Wallet created",
            description: `${selectedCoin.symbol} wallet created successfully`,
          });
          refetch();
          setIsDeposit(true);
        },
        onError: (error: any) => {
          toast({
            title: "Wallet creation failed",
            description:
              error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  /**
   * Deposit
   */
  const handleDeposit = () => {
    if (!existingWallet || !amount) return;

    depositCoin(
      {
        walletId: existingWallet.id,
        amount: Number(amount),
      },
      {
        onSuccess: () => {
          toast({
            title: "Deposit submitted",
            description:
              "Deposit submitted successfully. Awaiting admin approval.",
          });
          refetch();
          setAddCoinOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: "Deposit failed",
            description:
              error?.response?.data?.message ||
              error?.message ||
              "Something went wrong",
            variant: "destructive",
          });
        },
      }
    );
  };

  /**
   * Copy address
   */
  const handleCopy = () => {
    if (!selectedNetwork?.contractAddress) return;

    navigator.clipboard.writeText(selectedNetwork.contractAddress);
    toast({
      title: `${selectedCoin?.symbol} address copied`,
    });
  };

  return (
    <Dialog open={addCoinOpen} onOpenChange={setAddCoinOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Coin</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Coin */}
          <div className="space-y-2">
            <Label>Coin</Label>
            <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
              <SelectTrigger>
                <SelectValue placeholder="Select coin" />
              </SelectTrigger>
              <SelectContent>
                {coinList?.map((coin: any) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center gap-2">
                      {coin.iconUrl && (
                        <img src={coin.iconUrl} className="w-5 h-5" />
                      )}
                      <span>{coin.symbol}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Network */}
          {selectedCoin?.networks?.length > 0 && (
            <div className="space-y-2">
              <Label>Network</Label>
              <Select
                value={networkEntryId}
                onValueChange={setNetworkEntryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCoin.networks.map((n: any) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.network.name} ({n.network.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Create Wallet */}
          {selectedNetwork && !existingWallet && (
            <Button
              className="w-full"
              onClick={handleCreateWallet}
              disabled={creatingWallet}
            >
              {creatingWallet ? "Creating..." : "Create Wallet"}
            </Button>
          )}

          {/* Deposit */}
          {existingWallet && selectedNetwork && (
            <div className="space-y-3">
              <Label>Deposit Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Label>Deposit Address</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={selectedNetwork.contractAddress || ""}
                  className="font-mono"
                />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {selectedNetwork.qrCode && (
                <img
                  src={selectedNetwork.qrCode}
                  className="w-40 h-40 mx-auto border rounded"
                />
              )}

              <Button
                className="w-full"
                onClick={handleDeposit}
                disabled={depositing || !amount}
              >
                {depositing ? "Depositing..." : "Deposit"}
              </Button>
            </div>
          )}

          {isLoading && <p className="text-sm">Loading...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoins;
