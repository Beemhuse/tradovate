import { useState } from "react";
import { Sparkles, Plus, RefreshCw, Network } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreatePairFormData } from "./types";

interface CreatePairDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coins: any[];
  groupedCoins: Record<string, any[]>;
  onCreatePair: (formData: CreatePairFormData) => void;
  isLoading: boolean;
  loadingCoins: boolean;
}

const CreatePairDialog = ({
  open,
  onOpenChange,
  coins,
  groupedCoins,
  onCreatePair,
  isLoading,
  loadingCoins,
}: CreatePairDialogProps) => {
  const [baseCoinNetworkId, setBaseCoinNetworkId] = useState("");
  const [quoteCoinNetworkId, setQuoteCoinNetworkId] = useState("");

  const [pricePrecision, setPricePrecision] = useState(8);
  const [quantityPrecision, setQuantityPrecision] = useState(8);
  const [minTradeAmount, setMinTradeAmount] = useState("0.001");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedBaseCoin = coins.find((c) => c.id === baseCoinNetworkId);
  console.log("Selected Base Coin:", selectedBaseCoin);
  // Filter USDT coins from the same network
  const filteredQuoteCoins = coins.filter(
    (c) =>
      c.coin?.symbol === "USDT" &&
      c.network?.id === selectedBaseCoin?.network?.id
  );

const handleSubmit = () => {
  const errors: Record<string, string> = {};

  if (!baseCoinNetworkId) errors.baseCoinId = "Please select a base coin";
  if (!quoteCoinNetworkId) errors.quoteCoinId = "Please select a quote coin";

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  onCreatePair({
    baseCoinNetworkId,
    quoteCoinNetworkId,
  });
};


  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setBaseCoinNetworkId("");
      setQuoteCoinNetworkId("");
      setPricePrecision(8);
      setQuantityPrecision(8);
      setMinTradeAmount("0.001");
      setFormErrors({});
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create Trading Pair
          </DialogTitle>
          <DialogDescription>
            Add a new trading pair to the exchange. Only USDT pairs are
            supported as quote.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="base-coin">Base Coin</Label>
            <Select
              value={baseCoinNetworkId}
              onValueChange={(value) => {
                setBaseCoinNetworkId(value);
                setQuoteCoinNetworkId("");
              }}
              disabled={loadingCoins}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select base coin" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedCoins || {}).map(
                  ([network, networkCoins]) => (
                    <div key={network}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground sticky top-0 bg-background">
                        {network}
                      </div>
                      {(networkCoins as any[])
                        .filter((c) => c.coin?.symbol !== "USDT")
                        .map((coin) => (
                          <SelectItem key={coin.id} value={coin.id}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {coin.iconUrl ? (
                                  <img
                                    src={coin.iconUrl}
                                    alt={coin.coin?.symbol}
                                    className="w-5 h-5 rounded-full"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-bold">
                                      {coin.coin?.symbol?.charAt(0) || "?"}
                                    </span>
                                  </div>
                                )}
                                <span>{coin.coin?.symbol}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({coin.coin?.name})
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {network}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                    </div>
                  )
                )}
              </SelectContent>
            </Select>
            {formErrors.baseCoinId && (
              <p className="text-sm text-destructive">
                {formErrors.baseCoinId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-coin">Quote Coin (USDT)</Label>
          <Select
  value={quoteCoinNetworkId}
  onValueChange={setQuoteCoinNetworkId}
  disabled={!baseCoinNetworkId || loadingCoins || filteredQuoteCoins.length === 0}
>

              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !baseCoinNetworkId
                      ? "Select base coin first"
                      : filteredQuoteCoins.length === 0
                      ? "No USDT available on this network"
                      : "Select USDT pair"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredQuoteCoins.map((coin) => (
                  <SelectItem key={coin.id} value={coin.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">
                            $
                          </span>
                        </div>
                        <span>{coin.coin?.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          ({coin.coin?.name})
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {coin.network?.name}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.quoteCoinId && (
              <p className="text-sm text-destructive">
                {formErrors.quoteCoinId}
              </p>
            )}
            {baseCoinNetworkId && filteredQuoteCoins.length === 0 && (
              <p className="text-sm text-amber-600">
                No USDT available on the {selectedBaseCoin?.network?.name}{" "}
                network. Please select a different base coin.
              </p>
            )}
          </div>

          {selectedBaseCoin && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Pair Preview</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Network className="h-3 w-3 mr-1" />
                    {selectedBaseCoin.network?.name}
                  </Badge>
                  <Badge variant="outline">
                    Contract: {selectedBaseCoin.contractAddress?.slice(0, 8)}...
                  </Badge>
                </div>
              </div>
              <div className="text-lg font-bold">
                {selectedBaseCoin.coin?.symbol}/USDT
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Symbol: {selectedBaseCoin.coin?.symbol}USDT
              </div>
            </div>
          )}

          <Separator />

          {/* <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price-precision">Price Precision</Label>
              <Input
                id="price-precision"
                type="number"
                min="0"
                max="12"
                value={pricePrecision}
                onChange={(e) => setPricePrecision(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity-precision">Quantity Precision</Label>
              <Input
                id="quantity-precision"
                type="number"
                min="0"
                max="12"
                value={quantityPrecision}
                onChange={(e) => setQuantityPrecision(parseInt(e.target.value) || 0)}
              />
            </div>
          </div> */}

          {/* <div className="space-y-2">
            <Label htmlFor="min-trade">Minimum Trade Amount</Label>
            <Input
              id="min-trade"
              type="number"
              step="0.000001"
              min="0"
              value={minTradeAmount}
              onChange={(e) => setMinTradeAmount(e.target.value)}
            />
          </div> */}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!baseCoinNetworkId || !quoteCoinNetworkId || isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Pair
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePairDialog;
