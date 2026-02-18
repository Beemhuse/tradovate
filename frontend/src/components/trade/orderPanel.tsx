import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateData } from "@/hooks/use-api";
import { useFetchData } from "@/hooks/use-api";
import clsx from "clsx";
import { useToast } from "@/hooks/use-toast";
import { MARKET_PAIR } from "@/hooks/apiEndpoint";

type Props = {
  marketPairId: string; // 👈 New Prop
  symbol: string;
  currentPrice: number;
  availableBalance: number;
  USDTBalance: number;
  networkType: string;
  refetch: () => void;
};

type Direction = "BULLISH" | "BEARISH";

// We'll fetch trade periods (configs) from the pair endpoint and derive presets

const OrderPanel = ({
  marketPairId,
  symbol,
  networkType,
  currentPrice,
  availableBalance,
  USDTBalance,
  refetch,
}: Props) => {
  const [stake, setStake] = useState<number>(30);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [selectedPeriod, setSelectedPeriod] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch pair (includes active tradeConfigs)
  const { data: pairData } = useFetchData(MARKET_PAIR.GET_PAIR(marketPairId), "market-pair");
  const tradePeriods: any[] = pairData?.pair?.tradeConfigs ?? [];

  useEffect(() => {
    if (tradePeriods && tradePeriods.length > 0) {
      setSelectedPeriod((prev) => prev ?? tradePeriods[0]);
    }
  }, [tradePeriods]);

  // Derive preset amounts from selectedPeriod.minStake/maxStake
  const getPresets = (min: any, max: any) => {
    const a = Number(min) || 1;
    const b = Number(max) || a * 5;
    if (b <= a) return [a, a * 2, a * 3, a * 4, a * 5].map((v) => Number(v.toFixed(2)));
    const presets: number[] = [];
    const steps = 5;
    for (let i = 0; i < steps; i++) {
      const v = a + ((b - a) * i) / (steps - 1);
      presets.push(Number(v.toFixed(2)));
    }
    return presets;
  };

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
        marketPairId,
        period: selectedPeriod.period,
        direction,
        stake,
        entryPrice: currentPrice,
      },
      {
        onSuccess: () => {
          toast({
            title: "Trade Placed",
            description: "Trade placed successfully!",
          });
          setLoading(false);
          refetch();
        },
        onError: (err: any) => {
          toast({
            title: "Trade Failed",
            description:
              err?.response?.data?.error ||
              err?.response?.data?.message ||
              "Something went wrong",
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
        <span>{symbol} ({networkType})</span>
      </div>

      {/* Available Balance */}
      {/* <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{symbol.split("/")[0]} Balance</span>
        <span className="text-success font-medium">
          {availableBalance.toFixed(2)}
        </span>
      </div> */}

      {/* USDT Balance */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">USDT Trading Balance</span>
        <span className="text-success font-medium">
          {USDTBalance.toFixed(2)}
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
          {tradePeriods.map((p) => {
            const label =
              p.period === "S30"
                ? "30s"
                : p.period === "M1"
                ? "1m"
                : p.period === "M5"
                ? "5m"
                : p.period === "M15"
                ? "15m"
                : p.period;

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p)}
                className={clsx(
                  "p-3 rounded border text-xs transition",
                  selectedPeriod?.id === p.id
                    ? "bg-blue-500 text-black border-blue-500"
                    : "bg-gray-900 border-gray-700 hover:border-blue-400"
                )}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-[10px] opacity-80">
                  Profit {Number(p.profitRate) * 100}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Amounts */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">Amount (USDT)</p>
        <div className="grid grid-cols-5 gap-2">
          {(selectedPeriod ? getPresets(selectedPeriod.minStake, selectedPeriod.maxStake) : [30, 100, 200, 400, 1000]).map((value) => (
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
        // min={1}
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
          {selectedPeriod ? Number(stake) * Number(selectedPeriod.profitRate) : 0} USDT
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
