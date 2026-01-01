import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreatePairFormData } from "./types";
import { useFetchData } from "@/hooks/use-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coins: any[]; // CoinNetwork[]
  groupedCoins: Record<string, any[]>; // networkName -> CoinNetwork[]
  onCreatePair: (data: CreatePairFormData) => void;
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
}: Props) => {
  const [baseCoinNetworkId, setBaseCoinNetworkId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  /* ---------------------------------------------
   * Fast lookup
   * ------------------------------------------- */
  const coinById = useMemo(() => {
    const map = new Map<string, any>();
    coins.forEach((c) => map.set(c.id, c));
    return map;
  }, [coins]);

  const selectedBase = baseCoinNetworkId
    ? coinById.get(baseCoinNetworkId)
    : null;

  /* ---------------------------------------------
   * Fetch USDT for selected network
   * ------------------------------------------- */
  const { data, isLoading: usdtLoading } = useFetchData<{
    success: boolean;
    usdt: any | null;
  }>(
    selectedBase
      ? `/network/${selectedBase.network.id}/usdt`
      : null,
    selectedBase ? `usdt-${selectedBase.network.id}` : null
  );

  const usdtCoinNetwork = data?.usdt ?? null;

  /* ---------------------------------------------
   * Submit
   * ------------------------------------------- */
  const handleSubmit = () => {
    setError("");

    if (!selectedBase || !usdtCoinNetwork) {
      setError("USDT is not available on this network");
      return;
    }

    onCreatePair({
      baseCoinNetworkId: selectedBase.id,
      quoteCoinNetworkId: usdtCoinNetwork.id,
    });
  };

  /* ---------------------------------------------
   * Reset on close
   * ------------------------------------------- */
  const handleClose = (state: boolean) => {
    if (!state) {
      setBaseCoinNetworkId(null);
      setDropdownOpen(false);
      setError("");
    }
    onOpenChange(state);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Create Trading Pair
          </DialogTitle>
          <DialogDescription>
            Trading pairs are created per network. USDT must exist on the same
            network as the base asset.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* ---------------- BASE COIN ---------------- */}
          <div className="space-y-2">
            <Label>Base Coin</Label>

            <div
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full border rounded-md px-3 py-2 cursor-pointer bg-background"
            >
              {selectedBase
                ? `${selectedBase.symbol} (${selectedBase.network.name})`
                : "Select base coin"}
            </div>

            {dropdownOpen && (
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {Object.entries(groupedCoins).map(([networkName, list]) => (
                  <div key={networkName}>
                    <div className="px-3 py-2 text-xs font-semibold bg-muted">
                      {networkName}
                    </div>

                    {list
                      .filter((cn: any) => cn.symbol !== "USDT")
                      .map((cn: any) => (
                        <div
                          key={cn.id}
                          onClick={() => {
                            setBaseCoinNetworkId(cn.id);
                            setDropdownOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-accent cursor-pointer flex justify-between"
                        >
                          <span>{cn.symbol}</span>
                          <Badge variant="outline">
                            {cn.network.name}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------------- USDT STATUS ---------------- */}
          <div className="space-y-2">
            <Label>Quote Coin (USDT)</Label>

            <div className="border rounded-md px-3 py-2 text-sm">
              {usdtLoading && "Checking USDT availability..."}
              {!usdtLoading && usdtCoinNetwork && (
                <div className="flex justify-between">
                  <span>USDT</span>
                  <Badge variant="outline">
                    {usdtCoinNetwork.network.name}
                  </Badge>
                </div>
              )}
              {!usdtLoading && selectedBase && !usdtCoinNetwork && (
                <span className="text-amber-600">
                  USDT not available on this network
                </span>
              )}
            </div>
          </div>

          {/* ---------------- PREVIEW ---------------- */}
          {selectedBase && usdtCoinNetwork && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Pair Preview</span>
                <Badge variant="secondary">
                  <Network className="h-3 w-3 mr-1" />
                  {selectedBase.network.name}
                </Badge>
              </div>

              <div className="text-lg font-bold">
                {selectedBase.symbol}/USDT
              </div>

              <div className="text-xs text-muted-foreground">
                Symbol: {selectedBase.symbol}USDT
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Separator />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!usdtCoinNetwork || isLoading}
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
