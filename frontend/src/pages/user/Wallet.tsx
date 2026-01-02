import { useEffect, useMemo, useRef, useState } from "react";
import UserNav from "@/components/layout/UserNav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  WalletCards,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInitializeWallets } from "@/hooks/useWallet";
import { useCoins } from "@/hooks/useCoins";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import { useToast } from "@/hooks/use-toast";
import AddCoins from "@/components/modals/CreateWalets";
import { useFetchData } from "@/hooks/use-api";
import { COINS } from "@/hooks/apiEndpoint";
import CoinDeposit from "@/components/modals/CoinDeposit";
import CoinWithdrawal from "@/components/modals/CoinWithdrawal";

const Wallet = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [showBalance, setShowBalance] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [addCoinOpen, setAddCoinOpen] = useState(false);

  const initializedRef = useRef(false);

  const { data: coins } = useCoins();
  const initializeWallets = useInitializeWallets();

  const {
    data: assetData,
    refetch,
    isLoading,
  } = useFetchData(COINS.ASSETS, "assets");

  const assets = assetData?.assets || [];

  /**
   * Initialize wallets ONCE
   */
  useEffect(() => {
    if (!user || !coins?.length || initializedRef.current) return;

    initializeWallets.mutate();
    initializedRef.current = true;
  }, [user, coins?.length]);

  /**
   * Fetch prices
   */
  const coinSymbols = useMemo(
    () => assets.map((a) => a.coin?.symbol).filter(Boolean),
    [assets]
  );

  // const prices = useCryptoPrice(coinSymbols);

  /**
   * USDT conversion
   */
const getUSDTValue = (balance: number) => balance;


  /**
   * Total portfolio value
   */
  const totalBalance = useMemo(() => {
  return assets.reduce(
    (sum, wallet) => sum + Number(wallet.balance),
    0
  );
}, [assets]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Wallet Summary */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-muted-foreground">Total Balance</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            <p className="text-4xl font-bold">
              {showBalance
                ? `$${totalBalance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}`
                : "••••••"}
            </p>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setDepositOpen(true)}
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Deposit
              </Button>

              <Button
                variant="outline"
                onClick={() => setWithdrawOpen(true)}
              >
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                Withdraw
              </Button>

              <Button
                variant="outline"
                onClick={() => setAddCoinOpen(true)}
              >
                <WalletCards className="mr-2 h-4 w-4" />
                Add Coin
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader>
            <CardTitle>My Assets</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Coin</th>
                  <th className="text-right p-4">Available</th>
                  <th className="text-right p-4">Frozen</th>
                  <th className="text-right p-4">USDT Value</th>
                </tr>
              </thead>

              <tbody>
                {assets.map((wallet) => {
                  const symbol = wallet.coin?.symbol || "";
                  const usdtValue = getUSDTValue(Number(wallet.balance));


                  return (
                    <tr
                      key={wallet.id}
                      className="border-b hover:bg-secondary/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {wallet.coin?.iconUrl ? (
                            <img
                              src={wallet.coin.iconUrl}
                              className="h-8 w-8"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {symbol[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {wallet.coin?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {symbol}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="text-right p-4 font-mono">
                        $ {showBalance
                          ? Number(wallet.balance).toFixed(1)
                          : "••••"}
                      </td>

                      <td className="text-right p-4 text-muted-foreground font-mono">
                        {showBalance
                          ? Number(wallet.locked_balance || 0).toFixed(1)
                          : "••••"}
                      </td>

                      <td className="text-right p-4 font-semibold text-success">
                        {showBalance
                          ? `$${usdtValue.toFixed(2)}`
                          : "••••"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CoinDeposit
        addCoinOpen={depositOpen}
        setAddCoinOpen={setDepositOpen}
        assets={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

      <CoinWithdrawal
        withdrawOpen={withdrawOpen}
        setWithdrawOpen={setWithdrawOpen}
        coins={assets}
        refetch={refetch}
        isLoading={isLoading}
      />

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
