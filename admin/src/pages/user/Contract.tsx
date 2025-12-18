import UserNav from "@/components/layout/UserNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import TradingViewChart from "@/components/TradingViewChart";
import { useCryptoPrice } from "@/hooks/useCryptoPrice";
import { useToast } from "@/hooks/use-toast";

const Contract = () => {
  const { toast } = useToast();
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("30");
  const [isTrading, setIsTrading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [startPrice, setStartPrice] = useState<number | null>(null);
  const [tradeDirection, setTradeDirection] = useState<"bullish" | "bearish" | null>(null);

  const coins = ["BTC", "ETH", "BNB", "SOL"];
  const prices = useCryptoPrice(coins);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          completeTrade();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleTrade = (direction: "bullish" | "bearish") => {
    if (!selectedCoin || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Trade",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const currentPrice = parseFloat(prices[selectedCoin]?.price || "0");
    setStartPrice(currentPrice);
    setTradeDirection(direction);
    setIsTrading(true);
    setCountdown(parseInt(duration));

    toast({
      title: "Trade Started",
      description: `${direction.toUpperCase()} trade on ${selectedCoin}/USDT for $${amount}`,
    });
  };

  const completeTrade = () => {
    if (!selectedCoin || !startPrice || !tradeDirection) return;

    const endPrice = parseFloat(prices[selectedCoin]?.price || "0");
    const priceIncreased = endPrice > startPrice;
    const won =
      (tradeDirection === "bullish" && priceIncreased) ||
      (tradeDirection === "bearish" && !priceIncreased);

    const tradeAmount = parseFloat(amount);
    const profit = won ? tradeAmount * 0.85 : -tradeAmount;

    toast({
      title: won ? "Trade Won! 🎉" : "Trade Lost",
      description: `Start: $${startPrice.toFixed(2)} | End: $${endPrice.toFixed(2)} | ${
        won ? "Profit" : "Loss"
      }: $${Math.abs(profit).toFixed(2)}`,
      variant: won ? "default" : "destructive",
    });

    // Reset trade state
    setIsTrading(false);
    setStartPrice(null);
    setTradeDirection(null);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <UserNav />
      
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contract Trading</h1>
          <p className="text-muted-foreground">
            Predict market direction and earn profits in seconds
          </p>
        </div>

        {!selectedCoin ? (
          /* Coin Selection */
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {coins.map((coin) => {
              const priceData = prices[coin];
              return (
                <Card
                  key={coin}
                  className="hover:border-primary transition-all cursor-pointer"
                  onClick={() => setSelectedCoin(coin)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-2xl font-bold">{coin[0]}</span>
                      </div>
                      <div className={`text-sm font-semibold ${priceData?.positive ? "text-success" : "text-danger"}`}>
                        {priceData?.positive ? "+" : ""}{priceData?.changePercent24h}%
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{coin}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{coin}/USDT</p>
                    <p className="text-xl font-bold">${priceData?.price || "Loading..."}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Trading Interface */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Live Chart - {selectedCoin}/USDT</CardTitle>
              </CardHeader>
              <CardContent>
                <TradingViewChart symbol={`${selectedCoin}USDT`} height={400} />
              </CardContent>
            </Card>

            {/* Trading Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Place Trade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isTrading && countdown !== null && (
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <div className="text-5xl font-bold text-primary mb-2">{countdown}s</div>
                    <div className="text-sm text-muted-foreground">
                      Direction: <span className={tradeDirection === "bullish" ? "text-success" : "text-danger"}>
                        {tradeDirection?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Start Price: ${startPrice?.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current Price: ${prices[selectedCoin]?.price}
                    </div>
                  </div>
                )}

                {!isTrading && (
                  <>
                    <div className="space-y-2">
                      <Label>Trade Duration (seconds)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {["30", "60", "90", "120"].map((time) => (
                          <Button
                            key={time}
                            variant={duration === time ? "default" : "outline"}
                            onClick={() => setDuration(time)}
                          >
                            {time}s
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Trade Amount (USDT)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        className="h-20 text-lg"
                        variant="outline"
                        onClick={() => handleTrade("bullish")}
                        disabled={!amount}
                      >
                        <TrendingUp className="h-6 w-6 mr-2 text-success" />
                        <div className="text-left">
                          <div className="text-success">Bullish</div>
                          <div className="text-xs text-muted-foreground">Price will rise</div>
                        </div>
                      </Button>
                      <Button
                        className="h-20 text-lg"
                        variant="outline"
                        onClick={() => handleTrade("bearish")}
                        disabled={!amount}
                      >
                        <TrendingDown className="h-6 w-6 mr-2 text-danger" />
                        <div className="text-left">
                          <div className="text-danger">Bearish</div>
                          <div className="text-xs text-muted-foreground">Price will fall</div>
                        </div>
                      </Button>
                    </div>
                  </>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setSelectedCoin(null);
                    setIsTrading(false);
                    setCountdown(null);
                    setStartPrice(null);
                    setTradeDirection(null);
                  }}
                  disabled={isTrading}
                >
                  Back to Coin Selection
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contract;
