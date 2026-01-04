// pages/admin/CoinDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Globe, Wallet, Hash, Info } from "lucide-react";
import { useFetchData, usePatchData } from "@/hooks/use-api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import EditCoinDialog from "@/components/coin-management/edit-coin-dialog";
import ManageNetworksDialog from "@/components/coin-management/manage-networks-dialog";
import { UpdateCoinPayload } from "@/types/coins";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  iconUrl?: string | null;
  isActive?: boolean;
  description?: string;
  website?: string;
  networks?: Array<{
    id: string;
    name: string;
    type?: string;
    contractAddress?: string;
  }>;
  marketData?: {
    price?: number;
    marketCap?: number;
    volume24h?: number;
  };
};

const CoinDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: coin,
    isLoading,
    isError,
    refetch
  } = useFetchData<Coin>(`/market/coins/${id}`, ["coin", id]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNetworksOpen, setIsNetworksOpen] = useState(false);
  // const queryClient = useQueryClient();
  const toggleCoin = usePatchData<void, { id: string }>(
    ({ id }) => `/admin/coins/${id}/toggle`,
    [["coin", id], "admin-coins"]
  );
  const updateCoin = usePatchData<Coin, UpdateCoinPayload>(
    `/admin/coins/${id}`,
    ["admin-coins"]
  );
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !coin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-destructive">
            Coin not found or error loading coin details
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/admin/coins")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coins
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/coins")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-2xl font-bold">
                  {coin.iconUrl ? (
                    <img
                      src={coin.iconUrl}
                      alt={coin.symbol}
                      className="h-8 w-8"
                    />
                  ) : (
                    coin.symbol?.[0]
                  )}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{coin.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-muted-foreground text-lg">
                    {coin.symbol}
                  </span>
                  <Badge variant={coin.isActive ? "default" : "secondary"}>
                    {coin.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Coin
            </Button> */}

            <Button
              variant={coin.isActive ? "destructive" : "default"}
              onClick={async () => {
                await toggleCoin.mutateAsync({ id: coin.id });
                toast.success(
                  coin.isActive ? "Coin deactivated" : "Coin activated"
                );
                // queryClient.invalidateQueries({ queryKey: ["coin", id] });
              }}
            >
              {coin.isActive ? "Deactivate" : "Activate"}
            </Button>

            {coin.website && (
              <Button variant="outline" asChild>
                <a
                  href={coin.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Coin Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Coin Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coin.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </h3>
                    <p className="text-sm">{coin.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Network Address
                    </h3>
                    <p className="text-sm font-mono">
                      {coin?.networks[0].contractAddress}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Symbol
                    </h3>
                    <p className="text-sm">{coin.symbol}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Networks Card */}
            {coin.networks && coin.networks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Supported Networks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coin.networks.map((network) => (
                      <div
                        key={network.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{network.name}</div>
                          {network.network?.type && (
                            <div className="text-sm text-muted-foreground">
                              Type: {network.network.type}
                            </div>
                          )}
                          {network.network && (
                            <div className="text-sm font-mono flex items-center gap-2">
                              <Wallet className="h-3 w-3" />
                              {network.network.name}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline">
                          {network.network?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Platform Status</span>
                  <Badge variant={coin.isActive ? "default" : "secondary"}>
                    {coin.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Networks</span>
                  <span>{coin.networks?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Market Data Card */}
            {coin.marketData && (
              <Card>
                <CardHeader>
                  <CardTitle>Market Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coin.marketData.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">
                        ${coin.marketData.price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {coin.marketData.marketCap && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-medium">
                        ${coin.marketData.marketCap.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {coin.marketData.volume24h && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">24h Volume</span>
                      <span className="font-medium">
                        ${coin.marketData.volume24h.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Coin
                </Button> */}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsNetworksOpen(true)}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Manage Networks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* {coin && (
        <EditCoinDialog
          open={isEditOpen}
          coin={{
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            icon: coin.iconUrl || "",
            isActive: !!coin.isActive,
          }}
          onOpenChange={setIsEditOpen}
          onSave={async (data) => {
            await updateCoin.mutateAsync({ id: data.id, ...data });
            toast.success("Coin updated");
            setIsEditOpen(false);
            // queryClient.invalidateQueries({ queryKey: ["coin", id] });
          }}
        />
      )} */}

      <ManageNetworksDialog
        open={isNetworksOpen}
        coinId={coin.id}
        networks={coin.networks || []}
        refetchCoin={refetch}
        onOpenChange={setIsNetworksOpen}
      />
    </div>
  );
};

export default CoinDetailsPage;
