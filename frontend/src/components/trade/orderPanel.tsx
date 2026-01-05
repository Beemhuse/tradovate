import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateData } from "@/hooks/use-api";
import clsx from "clsx";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

type Props = {
  coinId: string;
  networkId: string;
  symbol: string;
  currentPrice: number;
  availableBalance: number;
};

type Direction = "BULLISH" | "BEARISH";

const PRESET_AMOUNTS = [30, 100, 200, 400, 1000];

const TRADE_PERIODS = [
  { label: "30s", period: "S30", profitPercent: 80 },
  { label: "1m", period: "M1", profitPercent: 90 },
  { label: "5m", period: "M5", profitPercent: 120 },
  { label: "15m", period: "M15", profitPercent: 150 },
] as const;

const OrderPanel = ({
  coinId,
  networkId,
  symbol,
  currentPrice,
  availableBalance,
}: Props) => {
  const [stake, setStake] = useState<number>(30);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [selectedPeriod, setSelectedPeriod] =
    useState<(typeof TRADE_PERIODS)[number]>(TRADE_PERIODS[0]);
  const [loading, setLoading] = useState(false);
  
    const { toast } = useToast();

  const { mutate } = useCreateData("/market/order", ["user-trades"]);

  const placeTrade = (direction: Direction) => {
    if (!stake || stake <= 0) {
      toast({
            title: "Trade Failed",
            description: "Enter a valid amount",
            variant: "destructive",
          });
      return;
    }

    setLoading(true);

    mutate(
      {
        coinId,
        // networkId,
        type: direction === "BULLISH" ? "BUY" : "SELL",
        // period: selectedPeriod.period,
        amount:stake,
        price: currentPrice,
      },
      {
        onSuccess: () => {
          toast({
            title: "Trade Placed",
            description: "Trade placed successfully!",
          });
          setLoading(false);
        },
        onError: (err: any) => {
          toast({
            title: "Trade Failed",
            description: (err as any)?.response?.data?.message || (err as any)?.response?.data?.error || (err as any)?.response?.data || err?.message || "Something went wrong",
            variant: "destructive",
          });
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-5 h-full bg-black text-white">
      {/* Symbol */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Symbol</span>
        <span>{symbol}</span>
      </div>

      {/* Available Balance */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Available Balance</span>
        <span className="text-success font-medium">
          {availableBalance.toFixed(2)}
        </span>
      </div>

      {/* Price */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Price</span>
        <span className="text-yellow-400 font-medium">
          {currentPrice.toFixed(2)}
        </span>
      </div>

      {/* Period Selection */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Trade Period</p>
        <div className="grid grid-cols-2 gap-2">
          {TRADE_PERIODS.map((p) => (
            <button
              key={p.period}
              onClick={() => setSelectedPeriod(p)}
              className={clsx(
                "p-3 rounded border text-xs transition",
                selectedPeriod.period === p.period
                  ? "bg-blue-500 text-black border-blue-500"
                  : "bg-gray-900 border-gray-700 hover:border-blue-400"
              )}
            >
              <div className="font-semibold">{p.label}</div>
              <div className="text-[10px] opacity-80">
                Profit {p.profitPercent}%
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preset Amounts */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Amount (USDT)</p>
        <div className="grid grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((value) => (
            <button
              key={value}
              onClick={() => {
                setStake(value);
                setSelectedPreset(value);
              }}
              className={clsx(
                "py-2 rounded text-xs border transition",
                selectedPreset === value
                  ? "bg-emerald-500 text-black border-emerald-500"
                  : "bg-gray-900 border-gray-700 hover:border-emerald-400"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <input
        type="number"
        min={1}
        value={stake}
        onChange={(e) => {
          setStake(Number(e.target.value));
          setSelectedPreset(null);
        }}
        className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded text-right"
      />

      {/* Expected Profit (UI ONLY) */}
      <div className="text-xs text-muted-foreground">
        Expected profit:{" "}
        <span className="text-green-400 font-medium">
          {(stake * selectedPeriod.profitPercent) / 100} USDT
        </span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          disabled={loading}
          onClick={() => placeTrade("BULLISH")}
          className="bg-green-500 hover:bg-green-600 text-black"
        >
          Bullish
        </Button>

        <Button
          disabled={loading}
          onClick={() => placeTrade("BEARISH")}
          className="bg-red-500 hover:bg-red-600 text-black"
        >
          Bearish
        </Button>
      </div>
    </div>
  );
};

export default OrderPanel;
