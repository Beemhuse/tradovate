import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


import {
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import {
  useFetchData,
  useCreateData,
  useUpdateData,
  useDeleteData,
  usePatchData,
} from "@/hooks/use-api";
import EditDialog from "@/components/admin/trading/EditDialog";
import TradingMain from "@/components/admin/trading/TradingMain";

interface Coin {
  id: string;
  coin: {
    symbol: string;
    name: string;
  };
  network: {
    id: string;
    name: string;
  };
}

interface TradingPair {
  id: string;
  symbol: string;
  wsSymbol: string;
  baseCoin: Coin;
  quoteCoin: Coin;
  isActive: boolean;
  lastPrice?: number;
  priceChangePercent?: number;
  volume24h?: number;
  createdAt: string;
  updatedAt: string;
}
interface TradableCoin {
  id: string;            // CoinNetwork ID
  coinId: string;
  symbol: string;
  name: string;
  network: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
  contractAddress?: string;
  decimals: number;
  isActive: boolean;
}


const AdminTradingPairs = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [baseCoinId, setBaseCoinId] = useState("");
  const [quoteCoinId, setQuoteCoinId] = useState("");
  const [pricePrecision, setPricePrecision] = useState<number>(8);
  const [quantityPrecision, setQuantityPrecision] = useState<number>(8);
  const [minTradeAmount, setMinTradeAmount] = useState<string>("0.001");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 🔹 Fetch coins
  const {
    data: coinsData,
    isLoading: loadingCoins,
    error: coinsError,
  } = useFetchData("/market/coins", "admin-coins");

  // 🔹 Fetch trading pairs with polling
  const {
    data: pairsData,
    isLoading: loadingPairs,
    refetch: refetchPairs,
    error: pairsError,
  } = useFetchData("/market/admin-pairs", "market-pairs");

  // 🔹 Mutations
  const { mutate: createPair, isPending: creating } = useCreateData(
    "/market/pairs",
    ["market-pairs"]
  );
console.log("pairsData", pairsData);
  const { mutate: updatePair, isPending: updating } = useUpdateData(
    "/market/pairs",
    ["market-pairs"]
  );

  const { mutate: patchPair, isPending: patching } = usePatchData(
    (payload) => `/market/pairs/${payload.id}`,
    ["market-pairs"]
  );

  const { mutate: deletePair, isPending: deleting } = useDeleteData(
    "/market/pairs",
    ["market-pairs"]
  );


  // Each tradable coin is (coin + network)


  const handleUpdatePair = () => {
    if (!selectedPair) return;

    const updateData = {
      id: selectedPair.id,
      pricePrecision,
      quantityPrecision,
      minTradeAmount: parseFloat(minTradeAmount),
    };

    updatePair(updateData, {
      onSuccess: () => {
        toast({
          title: "✅ Pair Updated",
          description: "Trading pair settings have been updated.",
          variant: "default",
        });
        setIsEditDialogOpen(false);
        resetForm();
      },
      onError: (error: any) => {
        toast({
          title: "❌ Update Failed",
          description: error.message || "Failed to update trading pair.",
          variant: "destructive",
        });
      },
    });
  };


  const handleDeletePair = () => {
    if (!selectedPair) return;

    deletePair(selectedPair.id, {
      onSuccess: () => {
        toast({
          title: "🗑️ Pair Deleted",
          description: `${selectedPair.symbol} has been removed from the exchange.`,
        });
        setIsDeleteDialogOpen(false);
        setSelectedPair(null);
      },
      onError: (error: any) => {
        toast({
          title: "❌ Deletion Failed",
          description: error.message || "Failed to delete trading pair.",
          variant: "destructive",
        });
      },
    });
  };


  const resetForm = () => {
    setBaseCoinId("");
    setQuoteCoinId("");
    setPricePrecision(8);
    setQuantityPrecision(8);
    setMinTradeAmount("0.001");
    setFormErrors({});
  };



  // Auto-refetch on mount
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     refetchPairs();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [refetchPairs]);

  if (pairsError || coinsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Failed to Load Data
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {pairsError?.message ||
                    coinsError?.message ||
                    "An error occurred"}
                </p>
                <Button
                  onClick={() => {
                    refetchPairs();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <TradingMain
        // pairs={filteredPairs}
        
      />

      {/* Edit Dialog */}
      <EditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        selectedPair={selectedPair}
        pricePrecision={pricePrecision}
        setPricePrecision={setPricePrecision}
        quantityPrecision={quantityPrecision}
        setQuantityPrecision={setQuantityPrecision}
        minTradeAmount={minTradeAmount}
        setMinTradeAmount={setMinTradeAmount}
        handleUpdatePair={handleUpdatePair}
        updating={updating}
      />
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Trading Pair
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              trading pair{" "}
              <span className="font-semibold">{selectedPair?.symbol}</span> and
              remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPair(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePair}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Pair
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTradingPairs;
