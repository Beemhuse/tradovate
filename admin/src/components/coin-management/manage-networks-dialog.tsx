import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useFetchData, usePatchData, useDeleteData, useCreateData } from "@/hooks/use-api";

/* ---------------------------- Types ---------------------------- */

type CoinNetwork = {
  id: string; // coinNetworkId
  networkId: string;
  isActive: boolean;
  network: {
    id: string;
    name: string;
    type?: string;
  };
};

type Network = {
  id: string;
  name: string;
  type?: string;
};

type Props = {
  open: boolean;
  coinId: string;
  networks: CoinNetwork[];
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  refetchCoin?: () => void;
};

const ManageNetworksDialog = ({
  open,
  coinId,
  networks,
  onOpenChange,
  onSuccess,
  refetchCoin,
}: Props) => {
  const [localNetworks, setLocalNetworks] = useState<CoinNetwork[]>(networks);

  const [selectedNetworkId, setSelectedNetworkId] = useState("");

  useEffect(() => {
    setLocalNetworks(networks);
  }, [networks]);

  /* ------------------------------- API -------------------------------- */

  // Toggle active
  const toggleNetwork = usePatchData<void, { networkId: string; data: any }>(
    ({ networkId }) => `/network/admin/coins/${coinId}/networks/${networkId}`,
    ["coin", coinId]
  );

  // Remove mapping
  const removeNetwork = useDeleteData<void>(
    ({ networkId }: { networkId: string }) =>
      `/network/admin/coins/${coinId}/networks/${networkId}`,
    ["coin", coinId]
  );

  // Add mapping (PATCH as requested)
  const addNetwork = useCreateData<void>(
   `/network/admin/coins/${coinId}/networks`,
    ["coin", coinId]
  );

  /* ------------------------- Available Networks ------------------------ */

  const { data: allNetworksData } = useFetchData<{
    networks: Network[];
  }>("/network/list", "admin-networks");

  const availableNetworks = useMemo(() => {
    const linkedNetworkIds = new Set(localNetworks.map((n) => n.networkId));

    return (allNetworksData?.networks || []).filter(
      (n) => !linkedNetworkIds.has(n.id)
    );
  }, [allNetworksData, localNetworks]);

  /* ------------------------------ Handlers ------------------------------ */

  // const handleToggle = async (network: CoinNetwork) => {
  //   try {
  //     await toggleNetwork.mutateAsync({
  //       networkId: network.networkId,
  //       data: { isActive: !network.isActive },
  //     });
  //     toast.success("Network status updated");
  //     onSuccess?.();
  //     refetchCoin()
  //   } catch {
  //     toast.error("Failed to update network");
  //   }
  // };

  const handleRemove = async (network: CoinNetwork) => {
    try {
      await removeNetwork.mutateAsync({
        networkId: network.networkId,
      });
      toast.success("Network removed");
      onSuccess?.();
      refetchCoin();
    } catch {
      toast.error("Failed to remove network");
    }
  };

  const handleAddNetwork = async () => {
    if (!selectedNetworkId) return;

    try {
      await addNetwork.mutateAsync({
        networkId: selectedNetworkId,
      });
      toast.success("Network added to coin");
      setSelectedNetworkId("");
      onSuccess?.();
      refetchCoin();
    } catch {
      toast.error("Failed to add network");
    }
  };

  /* -------------------------------- Render ------------------------------ */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Networks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing */}
          {localNetworks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No networks linked to this coin.
            </p>
          )}

          {localNetworks.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{item.network.name}</p>
                {item.network.type && (
                  <p className="text-sm text-muted-foreground">
                    {item.network.type}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* <Switch
                  checked={item.isActive}
                  onCheckedChange={() => handleToggle(item)}
                /> */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemove(item)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add */}
          {availableNetworks.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Network
              </div>

              <select
                className="w-full border rounded bg-black p-2"
                value={selectedNetworkId}
                onChange={(e) => setSelectedNetworkId(e.target.value)}
              >
                <option value="">Select network</option>
                {availableNetworks.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>

              <Button
                className="w-full"
                onClick={handleAddNetwork}
                disabled={!selectedNetworkId}
              >
                Add Network
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageNetworksDialog;
