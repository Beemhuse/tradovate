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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdateData, useCreateData, useDeleteData } from "@/hooks/use-api";

type NetworkItem = {
  id: string;
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
  const [localNetworks, setLocalNetworks] = useState<NetworkItem[]>(networks);

  useEffect(() => {
    setLocalNetworks(networks);
  }, [networks]);

  // 🔁 API hooks
  const updateNetwork = useUpdateData<
    void,
    { coinId: string; networkId: string; data: any }
  >(
    ({ coinId, networkId }) => `/admin/coins/${coinId}/networks/${networkId}`,
    ["coin", coinId]
  );

  const removeNetwork = useDeleteData<void>(
    ({ coinId, networkId }: any) =>
      `/admin/coins/${coinId}/networks/${networkId}`,
    ["coin", coinId]
  );

  const addNetwork = useCreateData<
    void,
    { coinId: string; networkId: string; contractAddress?: string }
  >(`/admin/coins/${coinId}/networks`, ["coin", coinId]);

  // 🔄 Handlers
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

  const handleContractChange = async (network: NetworkItem, value: string) => {
    setLocalNetworks((prev) =>
      prev.map((n) =>
        n.id === network.id ? { ...n, contractAddress: value } : n
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Networks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {localNetworks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No networks linked to this coin.
            </p>
          )}

          {localNetworks.map((network) => (
            <div key={network.id} className="border rounded-lg p-4 space-y-3">
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
                    handleContractChange(network, e.target.value)
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

          {/* Add network CTA (you can expand this later) */}
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Network (coming next)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageNetworksDialog;
