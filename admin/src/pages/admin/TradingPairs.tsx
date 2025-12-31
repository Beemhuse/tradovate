import { useState, useEffect, useMemo } from "react";
import AdminNav from "@/components/layout/AdminNav";
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

const AdminTradingPairs = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [baseCoinId, setBaseCoinId] = useState("");
  const [quoteCoinId, setQuoteCoinId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "volume" | "price" | "date">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
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

  const coins = useMemo(() => coinsData?.coins || [], [coinsData]);
  const pairs = useMemo(() => pairsData?.pairs || [], [pairsData]);

  // Group coins by network
  const groupedCoins = useMemo(() => {
    return coins.reduce((acc: Record<string, Coin[]>, coin: Coin) => {
      const networkName = coin.network.name;
      if (!acc[networkName]) {
        acc[networkName] = [];
      }
      acc[networkName].push(coin);
      return acc;
    }, {});
  }, [coins]);

  // Get unique networks
  const networks = useMemo(() => {
    const uniqueNetworks = new Set(
      coins.map((coin: Coin) => coin.network.name)
    );
    return Array.from(uniqueNetworks);
  }, [coins]);

  // Filter and sort pairs
  const filteredPairs = useMemo(() => {
    if (!pairs.length) return [];

    const filtered = pairs.filter((pair: TradingPair) => {
      const matchesSearch =
        pair.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.baseCoin?.coin?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        pair.baseCoin?.coin?.symbol
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && pair.isActive) ||
        (statusFilter === "inactive" && !pair.isActive);

      const matchesNetwork =
        networkFilter === "all" ||
        pair.baseCoin?.network?.name === networkFilter;

      return matchesSearch && matchesStatus && matchesNetwork;
    });

    // Sort
    filtered.sort((a: TradingPair, b: TradingPair) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case "volume":
          aValue = a.volume24h || 0;
          bValue = b.volume24h || 0;
          break;
        case "price":
          aValue = a.lastPrice || 0;
          bValue = b.lastPrice || 0;
          break;
        case "date":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.symbol;
          bValue = b.symbol;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [pairs, searchQuery, statusFilter, networkFilter, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const activePairs = pairs.filter((p: TradingPair) => p.isActive);
    const inactivePairs = pairs.filter((p: TradingPair) => !p.isActive);
    const totalVolume = pairs.reduce(
      (sum: number, p: TradingPair) => sum + (p.volume24h || 0),
      0
    );
    const averagePrice =
      pairs?.length > 0
        ? pairs?.reduce(
            (sum: number, p: TradingPair) => sum + (p.lastPrice || 0),
            0
          ) / pairs?.length
        : 0;

    return {
      total: pairs?.length,
      active: activePairs.length,
      inactive: inactivePairs.length,
      totalVolume,
      averagePrice,
      activePercentage:
        pairs.length > 0 ? (activePairs?.length / pairs.length) * 100 : 0,
    };
  }, [pairs]);


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

  const handleTogglePair = (pair: TradingPair, checked: boolean) => {
    patchPair(
      { id: pair.id, isActive: checked },
      {
        onSuccess: () => {
          toast({
            title: checked ? "✅ Pair Activated" : "⏸️ Pair Paused",
            description: `${pair.symbol} is now ${
              checked ? "active for trading" : "temporarily disabled"
            }`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "❌ Update Failed",
            description: error.message || "Failed to update pair status.",
            variant: "destructive",
          });
        },
      }
    );
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

  const handleEditPair = (pair: TradingPair) => {
    setSelectedPair(pair);
    setPricePrecision(8); // Default or fetch from pair data
    setQuantityPrecision(8);
    setMinTradeAmount("0.001");
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setBaseCoinId("");
    setQuoteCoinId("");
    setPricePrecision(8);
    setQuantityPrecision(8);
    setMinTradeAmount("0.001");
    setFormErrors({});
  };

  const handleSort = (field: "name" | "volume" | "price" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };


  // Auto-refetch on mount
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPairs();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetchPairs]);

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
        pairs={filteredPairs}
        coins={coins}
        baseCoinId={baseCoinId}
        setBaseCoinId={setBaseCoinId}
        quoteCoinId={quoteCoinId}
        setQuoteCoinId={setQuoteCoinId}
        sortBy={sortBy}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        networkFilter={networkFilter}
        setNetworkFilter={setNetworkFilter}
        formErrors={formErrors}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        loadingPairs={loadingPairs}
        refetchPairs={refetchPairs}
        groupedCoins={groupedCoins}
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        sortOrder={sortOrder}
        handleSort={handleSort}
        handleTogglePair={handleTogglePair}
        patching={patching}
        handleEditPair={handleEditPair}
        setSelectedPair={setSelectedPair}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
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
