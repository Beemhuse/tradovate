import { useState, useEffect, useMemo } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchData,
  useCreateData,
  useUpdateData,
  useDeleteData,
  usePatchData,
} from "@/hooks/use-api";
import { AlertCircle, RefreshCw, TrendingUp } from "lucide-react";

// Import components
import StatsCards from "./StatsCard";
import ControlBar from "./ControlBar";
import PairsTable from "./PairsTable";
import CreatePairDialog from "./CreatePairDialog";
import EditPairDialog from "./EditDialog";
import DeletePairDialog from "./DeletePairDialog";
import { Coin, TradingPair, CreatePairFormData, CoinNetwork } from "./types";

// Helper to transform coins data to the expected format
const transformCoinsData = (coinsData: any[]): any[] => {
  if (!coinsData || !Array.isArray(coinsData)) return [];
  
  const transformed: any[] = [];
  
  coinsData?.forEach((coin) => {
    if (coin.networks && Array.isArray(coin.networks)) {
      coin.networks.forEach((network: CoinNetwork) => {
        transformed.push({
          id: network.id, // Use network.id as the unique identifier
          coinId: coin.id,
          coin: {
            symbol: coin.symbol,
            name: coin.name,
          },
          network: {
            id: network.network.id,
            name: network.network.name,
          },
          iconUrl: coin.iconUrl,
          isActive: coin.isActive && network.isActive,
          contractAddress: network.contractAddress,
          decimals: network.decimals,
        });
      });
    }
  });
  
  return transformed;
};

const AdminTradingPairs = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "volume" | "price" | "date">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  // Transform coins data
  const coins = useMemo(() => {
    if (!coinsData || !Array.isArray(coinsData)) return [];
    return transformCoinsData(coinsData);
  }, [coinsData]);

  const pairs = useMemo(() => {
    if (!pairsData) return [];
    if (Array.isArray(pairsData)) return pairsData;
    if (pairsData.pairs) return pairsData.pairs;
    return [];
  }, [pairsData]);

  // Group coins by network
  const groupedCoins = useMemo(() => {
    return coins.reduce((acc: Record<string, any[]>, coin: any) => {
      const networkName = coin?.network?.name;
      if (!networkName) return acc;
      
      if (!acc[networkName]) {
        acc[networkName] = [];
      }
      acc[networkName].push(coin);
      return acc;
    }, {});
  }, [coins]);

  // Get unique networks
  const networks = useMemo(() => {
    const uniqueNetworks = new Set<string>();
    coins.forEach((coin: any) => {
      if (coin?.network?.name) {
        uniqueNetworks.add(coin.network.name);
      }
    });
    return Array.from(uniqueNetworks);
  }, [coins]);

  // Filter and sort pairs
  const filteredPairs = useMemo(() => {
    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) return [];

    const filtered = pairs.filter((pair: TradingPair) => {
      const matchesSearch =
        pair.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.baseCoin?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pair.baseCoin?.symbol?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && pair.isActive) ||
        (statusFilter === "inactive" && !pair.isActive);

      const matchesNetwork =
        networkFilter === "all" ||
        pair.baseCoin?.networks?.some((network: CoinNetwork) => 
          network.network.name === networkFilter
        );

      return matchesSearch && matchesStatus && matchesNetwork;
    });

    // Sort
    filtered.sort((a: TradingPair, b: TradingPair) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.symbol || "";
          bValue = b.symbol || "";
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
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          aValue = a.symbol || "";
          bValue = b.symbol || "";
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
    if (!pairs || !Array.isArray(pairs)) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        totalVolume: 0,
        averagePrice: 0,
        activePercentage: 0,
      };
    }

    const activePairs = pairs.filter((p: TradingPair) => p.isActive);
    const inactivePairs = pairs.filter((p: TradingPair) => !p.isActive);
    const totalVolume = pairs.reduce((sum: number, p: TradingPair) => sum + (p.volume24h || 0), 0);
    const averagePrice = pairs.length > 0 
      ? pairs.reduce((sum: number, p: TradingPair) => sum + (p.lastPrice || 0), 0) / pairs.length
      : 0;

    return {
      total: pairs.length,
      active: activePairs.length,
      inactive: inactivePairs.length,
      totalVolume,
      averagePrice,
      activePercentage: pairs.length > 0 ? (activePairs.length / pairs.length) * 100 : 0,
    };
  }, [pairs]);

  const handleCreatePair = (formData: CreatePairFormData) => {
    createPair(formData, {
      onSuccess: () => {
        toast({
          title: "🎉 Pair Created Successfully",
          description: "New trading pair has been added to the exchange.",
          variant: "default",
        });
        setIsCreateDialogOpen(false);
      },
      onError: (error: any) => {
        toast({
          title: "❌ Creation Failed",
          description: error.message || "Failed to create trading pair. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleUpdatePair = (formData: { pricePrecision: number; quantityPrecision: number; minTradeAmount: number }) => {
    if (!selectedPair) return;

    const updateData = {
      id: selectedPair.id,
      ...formData,
    };

    updatePair(updateData, {
      onSuccess: () => {
        toast({
          title: "✅ Pair Updated",
          description: "Trading pair settings have been updated.",
          variant: "default",
        });
        setIsEditDialogOpen(false);
        setSelectedPair(null);
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
            description: `${pair.symbol} is now ${checked ? "active for trading" : "temporarily disabled"}`,
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
    setIsEditDialogOpen(true);
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
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchPairs]);

  if (pairsError || coinsError) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {pairsError?.message || coinsError?.message || "An error occurred"}
                </p>
                <Button onClick={() => { refetchPairs(); }}>
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
      {/* <AdminNav /> */}

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Trading Pairs</h1>
                  <p className="text-muted-foreground">
                    Manage exchange trading pairs and market configuration
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards
            stats={stats}
            isLoading={loadingPairs}
            onRefresh={refetchPairs}
          />
        </div>

        {/* Control Bar */}
        <ControlBar
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          networkFilter={networkFilter}
          onNetworkFilterChange={setNetworkFilter}
          networks={networks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreatePairClick={() => setIsCreateDialogOpen(true)}
        />

        {/* Pairs Table */}
        <PairsTable
          pairs={filteredPairs}
          allPairs={pairs}
          isLoading={loadingPairs}
          onEditPair={handleEditPair}
          onTogglePair={handleTogglePair}
          onDeletePair={(pair) => {
            setSelectedPair(pair);
            setIsDeleteDialogOpen(true);
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          isPatching={patching}
          networkFilter={networkFilter}
          searchQuery={searchQuery}
          onCreatePairClick={() => setIsCreateDialogOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <CreatePairDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        coins={coins}
        groupedCoins={groupedCoins}
        onCreatePair={handleCreatePair}
        isLoading={creating}
        loadingCoins={loadingCoins}
      />

      <EditPairDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        pair={selectedPair}
        onUpdatePair={handleUpdatePair}
        isLoading={updating}
      />

      <DeletePairDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        pair={selectedPair}
        onDeletePair={handleDeletePair}
        isLoading={deleting}
      />
    </div>
  );
};

export default AdminTradingPairs;