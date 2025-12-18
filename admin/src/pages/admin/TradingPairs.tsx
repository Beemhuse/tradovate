import { useState } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Plus,
  TrendingUp,
  PauseCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  LineChart,
  Activity,
  Coins,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFetchData,
  useCreateData,
  useUpdateData,
  usePatchData,
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

const AdminTradingPairs = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [baseCoinId, setBaseCoinId] = useState("");
  const [quoteCoinId, setQuoteCoinId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  /* 🔹 Fetch active coins */
  const { data: coins, isLoading: loadingCoins } = useFetchData("/market/coins", ["admin-coins"]);

  /* 🔹 Fetch trading pairs */
  const { data: pairs, isLoading, refetch } = useFetchData(
    "/market/admin-pairs",
    "market-pairs"
  );

  /* 🔹 Create pair */
  const { mutate: createPair, isPending: creating } = useCreateData(
    "/market/pairs",
    ["market-pairs"]
  );

  const { mutate: updatePair } = usePatchData(
    (payload) => `/market/pairs/${payload.id}`,
    ["market-pairs"]
  );

  const handleCreate = () => {
    createPair(
      {
        baseCoinId,
        quoteCoinId,
      },
      {
        onSuccess: () => {
          toast({
            title: "✅ Trading Pair Created",
            description: "New trading pair has been successfully created.",
          });
          setOpen(false);
          setBaseCoinId("");
          setQuoteCoinId("");
        },
        onError: (error) => {
          toast({
            title: "❌ Creation Failed",
            description: error.message || "Failed to create trading pair.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleTogglePair = (pair: any, checked: boolean) => {
    updatePair(
      { id: pair.id, isActive: checked },
      {
        onSuccess: () => {
          toast({
            title: checked ? "✅ Pair Activated" : "⏸️ Pair Deactivated",
            description: `${pair.symbol} is now ${checked ? "active for trading" : "paused"}`,
          });
        },
        onError: () => {
          toast({
            title: "❌ Update Failed",
            description: "Failed to update pair status.",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Filter pairs based on status and search
  const filteredPairs = pairs?.pairs?.filter((pair: any) => {
    const matchesSearch = pair.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pair.baseCoin?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && pair.isActive) ||
                         (statusFilter === "inactive" && !pair.isActive);
    return matchesSearch && matchesStatus;
  });

  const activePairs = pairs?.pairs?.filter((p: any) => p.isActive) || [];
  const inactivePairs = pairs?.pairs?.filter((p: any) => !p.isActive) || [];

  // Get base coins (excluding USDT)
  const baseCoins = coins?.coins?.filter((c: any) => c.symbol !== "USDT") || [];
  
  // Get quote coins (only USDT for now)
  const quoteCoins = coins?.coins?.filter((c: any) => c.symbol === "USDT") || [];

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LineChart className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Trading Pairs</h1>
            </div>
            <p className="text-muted-foreground">
              Manage and configure exchange trading pairs
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <div className="bg-card border rounded-lg px-4 py-3 min-w-[140px]">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
              <div className="text-2xl font-bold">{activePairs.length}</div>
            </div>
            <div className="bg-card border rounded-lg px-4 py-3 min-w-[140px]">
              <div className="flex items-center gap-2 mb-1">
                <PauseCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Inactive</span>
              </div>
              <div className="text-2xl font-bold">{inactivePairs.length}</div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 w-full sm:w-auto">
            <Tabs value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  All ({pairs?.pairs?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active ({activePairs.length})
                </TabsTrigger>
                <TabsTrigger value="inactive" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Inactive ({inactivePairs.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Add Pair Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pair
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Create New Trading Pair
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base Coin</label>
                    <Select value={baseCoinId} onValueChange={setBaseCoinId} disabled={creating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select base coin" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCoins ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">Loading coins...</div>
                        ) : baseCoins.length === 0 ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">No base coins available</div>
                        ) : (
                          baseCoins.map((coin: any) => (
                            <SelectItem key={coin.id} value={coin.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                  {coin.symbol.substring(0, 2)}
                                </div>
                                <span>{coin.name} ({coin.symbol})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quote Coin (USD Pair)</label>
                    <Select value={quoteCoinId} onValueChange={setQuoteCoinId} disabled={creating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select quote coin" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCoins ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">Loading coins...</div>
                        ) : quoteCoins.length === 0 ? (
                          <div className="py-2 px-2 text-sm text-muted-foreground">No quote coins available</div>
                        ) : (
                          quoteCoins.map((coin: any) => (
                            <SelectItem key={coin.id} value={coin.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                  {coin.symbol.substring(0, 2)}
                                </div>
                                <span>{coin.name} ({coin.symbol})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      disabled={!baseCoinId || !quoteCoinId || creating}
                      onClick={handleCreate}
                    >
                      {creating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Trading Pair
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trading Pairs List
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-20 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredPairs?.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No matching pairs found' : 'No trading pairs available'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Start by creating your first trading pair'}
                </p>
                <Button onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Pair
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pair</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Base Coin</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">WebSocket</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPairs?.map((pair: any) => (
                      <tr
                        key={pair.id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              <span className="font-bold text-primary">
                                {pair.symbol?.split('/')[0]?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-base">{pair.symbol}</div>
                              <div className="text-sm text-muted-foreground">{pair.wsSymbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {pair.baseCoin?.symbol}
                            </Badge>
                            <span className="text-sm">{pair.baseCoin?.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {pair.wsSymbol}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          {pair.lastPrice ? (
                            <div className="font-semibold">
                              ${parseFloat(pair.lastPrice).toFixed(2)}
                              {pair.priceChangePercent && (
                                <span className={`text-xs ml-2 ${pair.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {pair.priceChangePercent >= 0 ? '↗' : '↘'} {Math.abs(pair.priceChangePercent)}%
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={pair.isActive ? "default" : "secondary"}
                            className={`flex items-center gap-1.5 w-fit ${
                              pair.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                            }`}
                          >
                            {pair.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <PauseCircle className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={pair.isActive}
                              onCheckedChange={(checked) => handleTogglePair(pair, checked)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Add edit functionality here
                                toast({
                                  title: "Edit Pair",
                                  description: `Edit functionality for ${pair.symbol} coming soon.`,
                                });
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary */}
            {filteredPairs && filteredPairs.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredPairs.length} of {pairs?.pairs?.length} pairs
                </div>
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{activePairs.length} active</span>
                  <span className="mx-2">•</span>
                  <span className="text-amber-600 font-medium">{inactivePairs.length} inactive</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTradingPairs;