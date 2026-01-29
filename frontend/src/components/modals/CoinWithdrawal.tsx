import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateData, useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import { API_URL } from "@/config/config";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  isLoading,
}: CoinWithdrawalProps) => {
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [enableConversion, setEnableConversion] = useState(false);
  const [convertToId, setConvertToId] = useState("");
  const [conversionRate, setConversionRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const { toast } = useToast();

  const { mutate: withdrawMutate, isPending: withdrawPending } = useCreateData(
    COINS.WITHDRAW,
    ["withdraw_coin"],
  );

  const totalBalance =
    coins?.reduce((sum, coin) => {
      const symbol = coin.symbol || "";
      return sum + Number(coin.balance);
    }, 0) || 0;

  const selectedCoinData = useMemo(() => {
    const coin = coins?.find((coin) => coin.walletId === selectedCoin);
    return coin;
  }, [coins, selectedCoin]);

  // Fetch conversion rate when conditions are met
  useEffect(() => {
    if (
      enableConversion &&
      selectedCoinData &&
      convertToId &&
      Number(withdrawAmount) > 0
    ) {
      const fetchConversion = async () => {
        try {
          const fromSymbol = selectedCoinData.coin.symbol;
          const toSymbol = coins.find((c: any) => c.coinId === convertToId)
            ?.coin?.symbol;

          if (!toSymbol) return;

          const response = await fetch(
            `${API_URL}/market/conversion?coinId=${selectedCoinData.coinId}&toCoinId=${convertToId}&amount=${withdrawAmount}`,
          );
          const data = await response.json();

          if (data.success && data.mode === "single") {
            setConversionRate(data.conversionRate);
            setConvertedAmount(data.convertedAmount);
          }
        } catch (error) {
          console.error("Error fetching conversion rate:", error);
        }
      };
      fetchConversion();
    }
  }, [enableConversion, selectedCoinData, convertToId, withdrawAmount, coins]);

  // Reset conversion state when dialog closes or coin changes
  useEffect(() => {
    if (!withdrawOpen) {
      setEnableConversion(false);
      setConvertToId("");
      setConversionRate(null);
      setConvertedAmount(null);
    }
  }, [withdrawOpen]);

  const handleWithdraw = async () => {
    if (!selectedCoin || !withdrawAmount || !withdrawAddress) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (Number(withdrawAmount) <= 10) {
      toast({
        title: "Amount must be greater than $10",
        variant: "destructive",
      });
      return;
    }
    if (selectedCoinData?.balance < Number(withdrawAmount)) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    if (enableConversion && !convertToId) {
      toast({
        title: "Please select target coin for conversion",
        variant: "destructive",
      });
      return;
    }

    const payload: any = {
      walletId: selectedCoinData?.walletId,
      amount: +withdrawAmount,
      toAddress: withdrawAddress,
    };

    // Add conversion parameter if enabled
    if (
      enableConversion &&
      convertToId &&
      convertToId !== selectedCoinData.coinId
    ) {
      payload.convertToId = convertToId;
    }

    withdrawMutate(payload, {
      onSuccess: () => {
        toast({
          title: "Coin withdrawal created",
          description: "Coin withdrawal was successfully!",
        });
        setWithdrawOpen(false);
        setWithdrawAmount("");
        setWithdrawAddress("");
        setSelectedCoin("");
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Coin withdrawal creation failed",
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
                  <SelectItem key={coin.walletId + index} value={coin.walletId}>
                    <div className="flex items-center gap-2">
                      <img
                        src={coin?.coin?.iconUrl}
                        alt={coin?.coin?.name}
                        className="w-6 h-6"
                      />
                      <span>{coin?.coin?.symbol}</span>
                      {coin?.network?.name && (
                        <span className="text-xs text-muted-foreground">
                          ({coin.network.name})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCoinData && (
            <div className="space-y-2 border-b pb-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground">
                  Available Coin Balance
                </Label>
                <p className="text-success font-semibold">
                  ${selectedCoinData?.balance}
                </p>
              </div>
              {selectedCoinData?.network?.name && (
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-muted-foreground">Network</Label>
                  <div className="flex items-center gap-2">
                    {selectedCoinData.network.icon && (
                      <img
                        src={selectedCoinData.network.icon}
                        alt={selectedCoinData.network.name}
                        className="h-4 w-4"
                      />
                    )}
                    <p className="font-medium text-sm">
                      {selectedCoinData.network.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversion Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-muted rounded">
            <Checkbox
              id="enable-conversion"
              checked={enableConversion}
              onCheckedChange={(checked) =>
                setEnableConversion(checked as boolean)
              }
            />
            <Label htmlFor="enable-conversion" className="cursor-pointer">
              Convert to another coin?
            </Label>
          </div>

          {/* Conversion Target Coin Selector */}
          {enableConversion && (
            <div className="space-y-2">
              <Label>Convert To Coin</Label>
              <Select value={convertToId} onValueChange={setConvertToId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target coin" />
                </SelectTrigger>
                <SelectContent>
                  {coins
                    ?.filter((c: any) => c.coinId !== selectedCoinData?.coinId)
                    .map((coin, index) => (
                      <SelectItem
                        key={coin.walletId + index}
                        value={coin.coinId}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={coin?.coin?.iconUrl}
                            alt={coin?.coin?.name}
                            className="w-6 h-6"
                          />
                          <span>{coin?.coin?.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            {enableConversion && conversionRate && convertedAmount && (
              <Alert className="mt-2 bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-900">
                  <div className="font-semibold">
                    Conversion Rate: 1 {selectedCoinData?.coin?.symbol} ={" "}
                    {conversionRate.toFixed(8)}{" "}
                    {
                      coins.find((c: any) => c.coinId === convertToId)?.coin
                        ?.symbol
                    }
                  </div>
                  <div className="mt-1">
                    You will receive:{" "}
                    <span className="font-bold">
                      {convertedAmount.toFixed(8)}{" "}
                      {
                        coins.find((c: any) => c.coinId === convertToId)?.coin
                          ?.symbol
                      }
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="space-y-2">
            <Label>Withdrawal Address</Label>
            <Input
              placeholder="Enter wallet address"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={withdrawPending}
            onClick={handleWithdraw}
          >
            {withdrawPending ? "Processing..." : "Submit Withdrawal Request"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Withdrawals require admin approval
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoinWithdrawal;
