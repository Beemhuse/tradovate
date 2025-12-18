import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateData } from "@/hooks/use-api";
import clsx from "clsx";

type Props = {
  pairId: string;
  symbol: string;
  currentPrice: number;
  availableBalance: number;
};

type Direction = "BUY" | "SELL";

const PRESET_AMOUNTS = [30, 100, 200, 400, 1000];

const TRADE_PERIODS = [
  { label: "30s", seconds: 30, profitPercent: 80 },
  { label: "1m", seconds: 60, profitPercent: 90 },
  { label: "5m", seconds: 300, profitPercent: 120 },
  { label: "15m", seconds: 900, profitPercent: 150 },
];

const OrderPanel = ({
  pairId,
  symbol,
  currentPrice,
  availableBalance,
}: Props) => {
  const [amount, setAmount] = useState<number>(30);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [selectedPeriod, setSelectedPeriod] =
    useState<(typeof TRADE_PERIODS)[number] | null>(TRADE_PERIODS[0]);
  const [loading, setLoading] = useState(false);

  const { mutate } = useCreateData("/market/orders", ["user-orders"]);

  const placeOrder = (direction: Direction) => {
    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    if (!selectedPeriod) {
      alert("Select a trading period");
      return;
    }

    setLoading(true);

    mutate(
      {
        pairId,
        type: direction,
        amount,
        price: currentPrice,
        periodSeconds: selectedPeriod.seconds,       // ✅ NEW
        profitPercent: selectedPeriod.profitPercent, // ✅ NEW
      },
      {
        onSuccess: () => {
          alert(`${direction} order placed`);
          setLoading(false);
        },
        onError: (err: any) => {
          alert(err?.message || "Order failed");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-5 bg-black text-white">
      {/* Symbol */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Symbol</span>
        <span>{symbol}</span>
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
          {TRADE_PERIODS.map((period) => (
            <button
              key={period.label}
              onClick={() => setSelectedPeriod(period)}
              className={clsx(
                "p-3 rounded border text-xs transition",
                selectedPeriod?.label === period.label
                  ? "bg-blue-500 text-black border-blue-500"
                  : "bg-gray-900 border-gray-700 hover:border-blue-400"
              )}
            >
              <div className="font-semibold">{period.label}</div>
              <div className="text-[10px] opacity-80">
                Profit {period.profitPercent}%
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
                setAmount(value);
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
        value={amount}
        onChange={(e) => {
          setAmount(Number(e.target.value));
          setSelectedPreset(null);
        }}
        className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded text-right"
      />

      {/* Expected Profit */}
      {selectedPeriod && (
        <div className="text-xs text-muted-foreground">
          Expected profit:{" "}
          <span className="text-green-400 font-medium">
            {(amount * selectedPeriod.profitPercent) / 100} USDT
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Button
          disabled={loading}
          onClick={() => placeOrder("BUY")}
          className="bg-green-500 hover:bg-green-600 text-black"
        >
          Bullish
        </Button>

        <Button
          disabled={loading}
          onClick={() => placeOrder("SELL")}
          className="bg-red-500 hover:bg-red-600 text-black"
        >
          Bearish
        </Button>
      </div>
    </div>
  );
};

export default OrderPanel;
