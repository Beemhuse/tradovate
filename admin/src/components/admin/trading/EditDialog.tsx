import { useState, useEffect } from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TradingPair, UpdatePairFormData } from "./types";

interface EditPairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pair: TradingPair | null;
  onUpdatePair: (formData: UpdatePairFormData) => void;
  isLoading: boolean;
}

const EditPairDialog = ({
  open,
  onOpenChange,
  pair,
  onUpdatePair,
  isLoading,
}: EditPairDialogProps) => {
  const [pricePrecision, setPricePrecision] = useState(8);
  const [quantityPrecision, setQuantityPrecision] = useState(8);
  const [minTradeAmount, setMinTradeAmount] = useState("0.001");
  const [minStake, setMinStake] = useState("");
  const [maxStake, setMaxStake] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (pair) {
      // Set actual values from pair data
      setPricePrecision(8);
      setQuantityPrecision(8);
      setMinTradeAmount("0.001");
      setMinStake(pair.minStake?.toString() || "");
      setMaxStake(pair.maxStake?.toString() || "");
      setError("");
    }
  }, [pair]);

  const handleSubmit = () => {
    setError("");

    // Validate required fields
    if (!minStake || !maxStake) {
      setError("Please fill in min and max stake values");
      return;
    }

    const minVal = Number(minStake);
    const maxVal = Number(maxStake);

    if (isNaN(minVal) || isNaN(maxVal)) {
      setError("Min and max stakes must be valid numbers");
      return;
    }

    if (minVal <= 0 || maxVal <= 0) {
      setError("Min and max stakes must be greater than 0");
      return;
    }

    if (minVal >= maxVal) {
      setError("Minimum stake must be less than maximum stake");
      return;
    }

    onUpdatePair({
      pricePrecision,
      quantityPrecision,
      minTradeAmount: parseFloat(minTradeAmount),
      minStake: minVal,
      maxStake: maxVal,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form
      setPricePrecision(8);
      setQuantityPrecision(8);
      setMinTradeAmount("0.001");
      setMinStake("");
      setMaxStake("");
      setError("");
    }
    onOpenChange(newOpen);
  };

  if (!pair) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Trading Pair</DialogTitle>
          <DialogDescription>
            Update settings for {pair.symbol}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Trading Stake Configuration */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/50">
            <Label className="font-semibold">Trade Configuration</Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-min-stake" className="text-xs">
                  Min Stake (USDT)
                </Label>
                <Input
                  id="edit-min-stake"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minStake}
                  onChange={(e) => setMinStake(e.target.value)}
                  placeholder="e.g., 10"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max-stake" className="text-xs">
                  Max Stake (USDT)
                </Label>
                <Input
                  id="edit-max-stake"
                  type="number"
                  step="0.01"
                  min="0"
                  value={maxStake}
                  onChange={(e) => setMaxStake(e.target.value)}
                  placeholder="e.g., 1000"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-3 border rounded-lg p-3 bg-muted/50">
            <Label className="font-semibold">Advanced Settings</Label>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-price-precision" className="text-xs">
                  Price Precision
                </Label>
                <Input
                  id="edit-price-precision"
                  type="number"
                  min="0"
                  max="12"
                  value={pricePrecision}
                  onChange={(e) => setPricePrecision(parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quantity-precision" className="text-xs">
                  Quantity Precision
                </Label>
                <Input
                  id="edit-quantity-precision"
                  type="number"
                  min="0"
                  max="12"
                  value={quantityPrecision}
                  onChange={(e) => setQuantityPrecision(parseInt(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-min-trade" className="text-xs">
                Minimum Trade Amount
              </Label>
              <Input
                id="edit-min-trade"
                type="number"
                step="0.000001"
                min="0"
                value={minTradeAmount}
                onChange={(e) => setMinTradeAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/50 rounded px-3 py-2">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPairDialog;