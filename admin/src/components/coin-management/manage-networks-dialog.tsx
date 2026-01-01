import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useUpdateData,
  useCreateData,
  useDeleteData,
  useFetchData,
  usePatchData,
} from "@/hooks/use-api";

type NetworkItem = {
  id: string; // networkId
  name: string;
  type?: string;
  contractAddress?: string;
  isActive?: boolean;
};

type Props = {
  open: boolean;
  coinId: string;
  networks: NetworkItem[];
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const ManageNetworksDialog = ({
  open,
  coinId,
  networks,
  onOpenChange,
  onSuccess,
}: Props) => {
  const [localNetworks, setLocalNetworks] =
    useState<NetworkItem[]>(networks);

  const [selectedNetworkId, setSelectedNetworkId] = useState("");
  const [newContract, setNewContract] = useState("");

  useEffect(() => {
    setLocalNetworks(networks);
  }, [networks]);

  /* -------------------------------- API -------------------------------- */

  const updateNetwork = usePatchData<
    void,
    { coinId: string; networkId: string; data: any }
  >(
    ({ coinId, networkId }) =>
      `/network/admin/coins/${coinId}/networks/${networkId}`,
    ["coin", coinId]
  );

  const removeNetwork = useDeleteData<void>(
    ({ coinId, networkId }: any) =>
      `/network/admin/coins/${coinId}/networks/${networkId}`,
    ["coin", coinId]
  );

  const addNetwork = useCreateData<
    void,
    { networkId: string; contractAddress?: string }
  >(`/admin/coins/${coinId}/networks`, ["coin", coinId]);

  /* -------------------------- Available Networks ------------------------ */

  const { data: allNetworksData } = useFetchData<{
    networks: NetworkItem[];
  }>("/admin/networks", ["admin-networks"]);

  const availableNetworks = useMemo(() => {
    const linkedIds = new Set(localNetworks.map((n) => n.id));
    return (allNetworksData?.networks || []).filter(
      (n) => !linkedIds.has(n.id)
    );
  }, [allNetworksData, localNetworks]);

  /* ------------------------------ Handlers ------------------------------ */

  const handleToggle = async (network: NetworkItem) => {
    try {
      await updateNetwork.mutateAsync({
        coinId,
        networkId: network.id,
        data: { isActive: !network.isActive },
      });
      toast.success("Network status updated");
      onSuccess?.();
    } catch {
      toast.error("Failed to update network");
    }
  };

  const handleContractChange = (
    networkId: string,
    value: string
  ) => {
    setLocalNetworks((prev) =>
      prev.map((n) =>
        n.id === networkId ? { ...n, contractAddress: value } : n
      )
    );
  };

  const saveContract = async (network: NetworkItem) => {
    try {
      await updateNetwork.mutateAsync({
        coinId,
        networkId: network.id,
        data: { contractAddress: network.contractAddress },
      });
      toast.success("Contract address updated");
      onSuccess?.();
    } catch {
      toast.error("Failed to update contract");
    }
  };

  const handleRemove = async (network: NetworkItem) => {
    try {
      await removeNetwork.mutateAsync({
        coinId,
        networkId: network.id,
      });
      toast.success("Network removed");
      onSuccess?.();
    } catch {
      toast.error("Failed to remove network");
    }
  };

  const handleAddNetwork = async () => {
    if (!selectedNetworkId) return;

    try {
      await addNetwork.mutateAsync({
        networkId: selectedNetworkId,
        contractAddress: newContract || undefined,
      });

      toast.success("Network added to coin");
      setSelectedNetworkId("");
      setNewContract("");
      onSuccess?.();
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
          {/* Existing Networks */}
          {localNetworks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No networks linked to this coin.
            </p>
          )}

          {localNetworks.map((network) => (
            <div
              key={network.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{network.name}</p>
                  {network.type && (
                    <p className="text-sm text-muted-foreground">
                      {network.type}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={!!network.isActive}
                    onCheckedChange={() => handleToggle(network)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemove(network)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Contract address"
                  value={network.contractAddress || ""}
                  onChange={(e) =>
                    handleContractChange(network.id, e.target.value)
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveContract(network)}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}

          {/* Add Network */}
          {availableNetworks.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              <div className="font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Network
              </div>

              <select
                className="w-full border rounded p-2"
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

              <Input
                placeholder="Contract address (optional)"
                value={newContract}
                onChange={(e) => setNewContract(e.target.value)}
              />

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
