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
import { TradingPair } from "./types";

interface EditPairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pair: TradingPair | null;
  onUpdatePair: (formData: { pricePrecision: number; quantityPrecision: number; minTradeAmount: number }) => void;
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

  useEffect(() => {
    if (pair) {
      // You would set actual values from pair data here
      setPricePrecision(8);
      setQuantityPrecision(8);
      setMinTradeAmount("0.001");
    }
  }, [pair]);

  const handleSubmit = () => {
    onUpdatePair({
      pricePrecision,
      quantityPrecision,
      minTradeAmount: parseFloat(minTradeAmount),
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form
      setPricePrecision(8);
      setQuantityPrecision(8);
      setMinTradeAmount("0.001");
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price-precision">Price Precision</Label>
              <Input
                id="edit-price-precision"
                type="number"
                min="0"
                max="12"
                value={pricePrecision}
                onChange={(e) => setPricePrecision(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity-precision">Quantity Precision</Label>
              <Input
                id="edit-quantity-precision"
                type="number"
                min="0"
                max="12"
                value={quantityPrecision}
                onChange={(e) => setQuantityPrecision(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-min-trade">Minimum Trade Amount</Label>
            <Input
              id="edit-min-trade"
              type="number"
              step="0.000001"
              min="0"
              value={minTradeAmount}
              onChange={(e) => setMinTradeAmount(e.target.value)}
            />
          </div>
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