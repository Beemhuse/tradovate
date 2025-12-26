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
import { cn } from "@/lib/utils";

interface AddCoinsProps {
  addCoinOpen: boolean;
  setAddCoinOpen: (open: boolean) => void;
  assets: any;
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
  const [selectedCoinToAdd, setSelectedCoinToAdd] = useState<string>("");
  const [isDeposite, setIsDeposite] = useState<boolean>(false);
  const [isFundWallet, setIsFundWallet] = useState<boolean>(true);
  const [networkId, setNetworkId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const { data: coinList } = useFetchData(COINS.COINLIST, "coin_list");

  const { mutate: createCoin, isPending: createCoinPending } = useCreateData(
    COINS.CREATE,
    ["create_coin"]
  );
  const { mutate: coinDepositMutate, isPending: coinDepositPending } =
    useCreateData(COINS.DEPOSIT, ["coin_deposit"]);

  const { toast } = useToast();

  const selectedCoinData = useMemo(() => {
    const coin = coinList?.find((coin) => coin.id === selectedCoinToAdd);

    return coin;
  }, [coinList, selectedCoinToAdd]);

  const coinData = useMemo(() => {
    const coin = assets?.find((coin) => coin.coinId === selectedCoinToAdd);
    return coin;
  }, [assets, selectedCoinToAdd]);

  const handleCopyAddress = () => {
    if (coinData?.address || coinData?.contractAddress) {
      navigator.clipboard.writeText(
        coinData?.address || coinData?.contractAddress
      );
      toast({ title: coinData?.coin?.name + " Address copied!" });
    }
  };
  const handleFundCoinWallet = () => {
    const payload = {
      coinId: selectedCoinData?.id,
      networkId: networkId,
    };

    createCoin(payload, {
      onSuccess: () => {
        toast({
          title: "Coin wallet created",
          description: "Coin wallet created successfully!",
        });
        // setIsDeposite(true);
        // setIsFundWallet(false);
        // refetch();
      },
      onError: (error) => {
        toast({
          title: "Coin wallet creation failed",
          description:
            (error as any)?.response?.data?.message ||
            (error as any)?.response?.data?.error ||
            (error as any)?.response?.data ||
            error?.message ||
            "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };
  const handleCoinDeposit = () => {
    const payload = {
      walletId: coinData?.id,
      amount: +amount,
    };
    coinDepositMutate(payload, {
      onSuccess: () => {
        toast({
          title: "Coin deposited successfully",
          description:
            coinData?.coin?.name +
            " deposited successfully!, wait for admin approval",
        });
        refetch();
        setIsDeposite(true);
      },
      onError: (error) => {
        toast({
          title: "Coin deposit creation failed",
          description:
            (error as any)?.response?.data?.message ||
            (error as any)?.response?.data?.error ||
            (error as any)?.response?.data ||
            error?.message ||
            "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };
  return (
    <Dialog open={addCoinOpen} onOpenChange={setAddCoinOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Coin Wallet Address</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            {/* selected coin address */}
            <div className="space-y-2 w-full">
              <Label>Select Coin </Label>
              <Select
                value={selectedCoinToAdd}
                onValueChange={setSelectedCoinToAdd}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {coinList?.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={coin?.iconUrl}
                          alt={coin.name}
                          className="w-6 h-6"
                        />
                        <span>{coin?.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* selected coin networks */}
            <div
              className={cn(
                "origin-right transition-all duration-200",
                selectedCoinData?.networks?.length > 0
                  ? "w-fit scale-100"
                  : "w-0 scale-0"
              )}
            >
              <Label>Network </Label>
              <Select value={networkId} onValueChange={setNetworkId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCoinData?.networks?.map((network) => (
                    <SelectItem
                      key={network?.networkId}
                      value={network?.networkId}
                    >
                      <span>{network?.network?.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCoinData && networkId && isFundWallet && (
            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                className="w-full hover:bg-transparent hover:text-primary text-primary hover:scale-95 transition-all duration-200"
                onClick={() => setAddCoinOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="w-full hover:scale-95 transition-all duration-200"
                onClick={handleFundCoinWallet}
                disabled={createCoinPending}
              >
                {createCoinPending ? "Creating..." : "Create Wallet"}
              </Button>
            </div>
          )}
          {isLoading && <div>Loading...</div>}
          {isDeposite && coinData && !isLoading && (
            <div className="space-y-2">
              <Label>Deposit Amount</Label>
              <div className="flex gap-2">
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="font-mono text-sm"
                />
              </div>
              <Label>Deposit Address</Label>
              <div className="flex gap-2">
                <Input
                  value={coinData?.address || coinData?.contractAddress}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pb-5">
                Send only {selectedCoinData.symbol} to this address. Deposits
                will be credited after admin approval.
              </p>

              <p className="text-xs text-muted-foreground pb-5 flex flex-col items-center gap-2">
                <img
                  src={coinData?.qrCode}
                  alt="se"
                  className="w-40 h-40 rounded-md border p-1"
                />
                Scan and send only {coinData?.coin?.symbol} to this address.
              </p>

              <div className="w-full flex gap-2">
                <Button
                  variant="outline"
                  className="w-full hover:bg-transparent hover:text-primary text-primary hover:scale-95 transition-all duration-200"
                  onClick={() => setAddCoinOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="w-full hover:scale-95 transition-all duration-200"
                  onClick={handleCoinDeposit}
                  disabled={coinDepositPending}
                >
                  {coinDepositPending ? "Depositing..." : "Deposit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCoins;
