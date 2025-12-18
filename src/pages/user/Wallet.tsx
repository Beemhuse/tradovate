import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign, Eye, EyeOff, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet, useInitializeWallets } from "@/hooks/useWallet";
import { useCoins } from "@/hooks/useCoins";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Wallet = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  
  const { user, isLoading: authLoading } = useAuth();
  const { data: wallets, isLoading: walletsLoading } = useWallet();
  const { data: coins } = useCoins();
  const initializeWallets = useInitializeWallets();
  const { toast } = useToast();
  const navigate = useNavigate();

  const coinSymbols = coins?.map((c) => c.symbol) || [];
  const prices = useCryptoPrice(coinSymbols);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && coins && coins.length > 0) {
      initializeWallets.mutate();
    }
  }, [user, coins?.length]);

  const calculateUSDTValue = (symbol: string, balance: number) => {
    if (symbol === "USDT") return balance;
    const price = parseFloat(prices[symbol]?.price || "0");
    return balance * price;
  };

  const totalBalance = wallets?.reduce((sum, wallet) => {
    const symbol = wallet.coins?.symbol || "";
    return sum + calculateUSDTValue(symbol, Number(wallet.available_balance));
  }, 0) || 0;

  const selectedCoinData = coins?.find((c) => c.id === selectedCoin);

  const handleCopyAddress = () => {
    if (selectedCoinData?.deposit_address) {
      navigator.clipboard.writeText(selectedCoinData.deposit_address);
      toast({ title: "Address copied!" });
    }
  };

  const handleWithdraw = async () => {
    if (!selectedCoin || !withdrawAmount || !withdrawAddress) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user?.id,
      coin_id: selectedCoin,
      type: "withdrawal",
      amount: parseFloat(withdrawAmount),
      status: "pending",
      tx_hash: withdrawAddress,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Withdrawal request submitted", description: "Pending admin approval" });
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawAddress("");
    }
  };

  if (authLoading || walletsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UserNav />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Wallet Summary */}
        <Card className="crypto-glow">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-muted-foreground">Total Balance</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-4xl font-bold">
                {showBalance
                  ? `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "••••••"}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button className="flex-1 min-w-[120px]" onClick={() => setDepositOpen(true)}>
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => setWithdrawOpen(true)}>
                  <ArrowUpFromLine className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
                <Button variant="outline" className="flex-1 min-w-[120px]">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Buy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
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
                    <th className="text-right py-3 px-4">Available</th>
                    <th className="text-right py-3 px-4">Frozen</th>
                    <th className="text-right py-3 px-4">USDT Value</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets?.map((wallet) => {
                    const symbol = wallet.coins?.symbol || "";
                    const usdtValue = calculateUSDTValue(symbol, Number(wallet.available_balance));
                    return (
                      <tr
                        key={wallet.id}
                        className="border-b border-border hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold">
                                {wallet.coins?.icon_url || symbol[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{wallet.coins?.name}</p>
                              <p className="text-sm text-muted-foreground">{symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-mono">
                          {showBalance ? Number(wallet.available_balance).toFixed(8) : "••••"}
                        </td>
                        <td className="text-right py-4 px-4 font-mono text-muted-foreground">
                          {showBalance ? Number(wallet.locked_balance).toFixed(8) : "••••"}
                        </td>
                        <td className="text-right py-4 px-4 font-semibold">
                          {showBalance ? `$${usdtValue.toFixed(2)}` : "••••••"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Coin</Label>
              <Select value={selectedCoin} onValueChange={setSelectedCoin}>
                <SelectTrigger>
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent>
                  {coins?.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCoinData?.deposit_address && (
              <div className="space-y-2">
                <Label>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input value={selectedCoinData.deposit_address} readOnly className="font-mono text-sm" />
                  <Button variant="outline" size="icon" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send only {selectedCoinData.symbol} to this address. Deposits will be credited after admin approval.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
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
                  {coins?.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      {coin.name} ({coin.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <Button className="w-full" onClick={handleWithdraw}>
              Submit Withdrawal Request
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Withdrawals require admin approval
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Wallet;
