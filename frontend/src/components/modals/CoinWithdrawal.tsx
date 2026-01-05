import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo, useState } from 'react'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateData, useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
interface CoinWithdrawalProps {
    withdrawOpen: boolean;
    setWithdrawOpen: (open: boolean) => void;
    coins: any;
    refetch: () => void;
    isLoading: boolean;
}

const CoinWithdrawal = ({ 
    withdrawOpen, 
    setWithdrawOpen, 
    coins, 
    refetch, 
    isLoading 
}: CoinWithdrawalProps) => {
    const [selectedCoin, setSelectedCoin] = useState<string>("");
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawAddress, setWithdrawAddress] = useState("");

    const { toast } = useToast();

    const { mutate: withdrawMutate, isPending: withdrawPending } = useCreateData(COINS.WITHDRAW, ["withdraw_coin"])

    const totalBalance = coins?.reduce((sum, coin) => {
        const symbol = coin.symbol || "";
        return sum + Number(coin.balance);
    }, 0) || 0;

    const selectedCoinData = useMemo(() => {
        const coin = coins?.find((coin) => coin.coinId === selectedCoin);
        return coin;
    }, [coins, selectedCoin]);
    const handleWithdraw = async () => {
        if (!selectedCoin || !withdrawAmount || !withdrawAddress) {
          toast({ title: "Please fill all fields", variant: "destructive" });
          return;
        }
        if (Number(withdrawAmount) <= 10) {
          toast({ title: "Amount must be greater than $10", variant: "destructive" });
          return;
        }
        if (selectedCoinData?.balance < Number(withdrawAmount)) {
          toast({ title: "Insufficient balance", variant: "destructive" });
          return;
        }
        const payload = {
            walletId: selectedCoinData?.id,
            amount: +withdrawAmount,
            toAddress: withdrawAddress,
        }    
        withdrawMutate(payload,{
            onSuccess: () => {
                toast({
                    title: "Coin withdrawal created",
                    description: "Coin withdrawal was successfully!",
                });
                setWithdrawOpen(false);
                refetch();
            },
            onError: (error) => {
                toast({
                    title: "Coin withdrawal creation failed",
                    description: (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || (error as any)?.response?.data || error?.message || "Something went wrong",
                    variant: "destructive",
                });
            },
        });
    }
    return (
    <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Coin</Label>
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {coins?.map((coin, index) => (
                    <SelectItem key={coin.coinId + index} value={coin.coinId}>
                        <div className="flex items-center gap-2">
                            <img src={coin?.coin?.iconUrl} alt={coin?.coin?.name} className="w-6 h-6" />
                            <span>{coin?.coin?.symbol}</span>
                        </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {
                selectedCoinData && (
                    <div className="flex items-center justify-between gap-2">
                        <Label className="text-muted-foreground">Available Coin Balance</Label>
                        <p  className="text-success font-semibold">${selectedCoinData?.balance}</p>
                    </div>
                )
            }
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Withdrawal Address</Label>
              <Input
                placeholder="Enter wallet address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
              />
            </div>
            <Button className="w-full" disabled={withdrawPending} onClick={handleWithdraw}>
              {withdrawPending ? "Processing..." : "Submit Withdrawal Request"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Withdrawals require admin approval
            </p>
          </div>
        </DialogContent>
      </Dialog>
  )
}

export default CoinWithdrawal