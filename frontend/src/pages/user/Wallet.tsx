import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine, DollarSign, WalletCards, Eye, EyeOff, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInitializeWallets } from "@/hooks/useWallet";
import { useCoins } from "@/hooks/useCoins";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import AddCoins from "@/components/modals/CreateWalets";
import { useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";
import CoinDeposit from "@/components/modals/CoinDeposit";
import CoinWithdrawal from "@/components/modals/CoinWithdrawal";
import BankWithdrawal from "@/components/modals/BankWithdrawal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Wallet = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankWithdrawOpen, setBankWithdrawOpen] = useState(false);
  const [addCoinOpen, setAddCoinOpen] = useState(false);

  const { user, isLoading: authLoading } = useAuth();
  const { data: coins } = useCoins();
  const initializeWallets = useInitializeWallets();

  const { data: assetData, refetch, isLoading } = useFetchData(COINS.ASSETS, "assets")

  const assets = assetData?.assets

  const coinSymbols = assets?.map((c) => c?.coin?.symbol) || [];
  const prices = useCryptoPrice(coinSymbols);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }


  const totalBalance = assets?.reduce((sum, coin) => {
    const symbol = coin.symbol || "";
    return sum + Number(coin.balance);
  }, 0) || 0;


  return (
    <div className="min-h-screen bg-background">
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
                <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => setDepositOpen(true)}>
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-1 min-w-[120px]">
                      <ArrowUpFromLine className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuItem
                      onClick={() => {
                        setWithdrawOpen(true);
                        setBankWithdrawOpen(false);
                      }}
                    >
                      Crypto Currency
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setBankWithdrawOpen(true);
                        setWithdrawOpen(false);
                      }}
                    >
                      Bank
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => setAddCoinOpen(true)}>
                  <WalletCards className="h-4 w-4 mr-2" />
                  Add coin to wallet
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
                  {assets?.map((wallet, index) => {
                    const symbol = wallet.coin?.symbol || "";
      // coupon_code: appliedCoupon?.code || null,
                    const usdtValue = calculateUSDTValue(symbol, Number(wallet.balance));
                    return (
                      <tr
                        key={wallet.coinId + `${index}`}
                        className="border-b border-border hover:bg-secondary/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <img src={wallet.coin?.iconUrl || symbol[0]} />
                            </div>
                            <div>
                              <p className="font-medium">{wallet.coin?.name}</p>
                              <p className="text-sm text-muted-foreground">{symbol}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-mono">
                          {showBalance ? Number(wallet.balance).toFixed(2) : "••••"}
                        </td>
                        <td className="text-right py-4 px-4 font-mono text-muted-foreground">
                          {showBalance ? (Number(wallet.locked_balance) ? Number(wallet.locked_balance).toFixed(8) : "0.0") : "••••"}
                        </td>
                        <td className="text-right py-4 px-4 font-semibold text-success">
                          {/* {showBalance ? `$${usdtValue.toFixed(2)}` : "••••••"} */}
                          {showBalance ? `$${Number(wallet.balance)}` : "••••••"}
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
      <CoinDeposit
        addCoinOpen={depositOpen}
        setAddCoinOpen={setDepositOpen}
        assets={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

      {/* Withdraw Dialog */}
      <CoinWithdrawal
        withdrawOpen={withdrawOpen}
        setWithdrawOpen={setWithdrawOpen}
        coins={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

      {/* Bank Withdraw Dialog */}
      <BankWithdrawal
        withdrawOpen={bankWithdrawOpen}
        setWithdrawOpen={setBankWithdrawOpen}
        coins={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

      {/* add coin Dialog */}

      <AddCoins
        addCoinOpen={addCoinOpen}
        setAddCoinOpen={setAddCoinOpen}
        assets={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

    </div>
  );
};

export default Wallet;
