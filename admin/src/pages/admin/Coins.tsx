import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import CoinCard from "@/components/coin-management/coin-card";
import CoinTable from "@/components/coin-management/coin-table";
import CoinForm from "@/components/coin-management/coin-form";
import EditCoinDialog from "@/components/coin-management/edit-coin-dialog";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useFetchData,
  useCreateData,
  useUpdateData,
  usePatchData,
} from "@/hooks/use-api";
import { HARDCODED_NETWORKS } from "@/constants/networks";
import {
  Coin,
  CreateCoinPayload,
  UpdateCoinPayload,
  Network,
} from "@/types/coins";

const AdminCoinsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoin, setEditingCoin] = useState<Coin | null>(null);

  /* ---------------- API ---------------- */

  const { data: networksData } = useFetchData<{
    success: boolean;
    networks: Network[];
  }>("/admin/networks", "admin-networks");

  const allNetworks = networksData?.networks || HARDCODED_NETWORKS;

  const {
    data: coinsData,
    isLoading,
    isError,
    refetch,
  } = useFetchData<{ success: boolean; coins: Coin[] }>(
    "/admin/coins",
    "admin-coins"
  );

  const coins = coinsData?.coins || [];

  const createCoin = useCreateData<Coin, CreateCoinPayload>("/admin/coins", [
    "admin-coins",
    "/market/coins",
  ]);

  const updateCoin = useUpdateData<Coin, UpdateCoinPayload>("/admin/coins", [
    "admin-coins",
  ]);
  const toggleCoinStatus = usePatchData<
    void,
    { coinId: string; toggleNetworks?: boolean }
  >("/admin/toggle/coins/status", ["admin-coins"]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-coins"] });
  }, [activeTab]);

  const filteredCoins = coins.filter(
    (coin) => !!coin.isActive === (activeTab === "active")
  );

  /* ---------------- ACTIONS ---------------- */

  const handleCreate = async (payload: CreateCoinPayload) => {
    try {
      await createCoin.mutateAsync(payload);
      toast.success("Coin created");
      setIsAddOpen(false);
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Create failed");
    }
  };

  const handleEditSave = async (payload: UpdateCoinPayload) => {
    try {
      await updateCoin.mutateAsync(payload);
      toast.success("Coin updated");
      setIsEditOpen(false);
      setEditingCoin(null);
    } catch {
      toast.error("Update failed");
    }
  };

  /* ---------------- RENDER ---------------- */

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (isError)
    return (
      <div className="p-8">
        Failed to load coins <button onClick={() => refetch()}>Retry</button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Coin Management</h1>
            <p className="text-muted-foreground">Total: {coins.length}</p>
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={activeTab}
              onChange={(e) =>
                setActiveTab(e.target.value as "active" | "inactive")
              }
              className="p-2 border rounded text-black"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Button onClick={() => setIsAddOpen(true)}>Add Coin</Button>
          </div>
        </div>

        {/* ACTIVE */}
        {activeTab === "active" && (
          <CoinCard title="Active Coins">
            <CoinTable
              coins={filteredCoins}
              onEdit={(coin) => {
                setEditingCoin(coin);
                setIsEditOpen(true);
              }}
              onToggleStatus={async (coin) => {
                await toggleCoinStatus.mutateAsync({
                  coinId: coin.id,
                  toggleNetworks: true,
                });
                toast.success("Coin deactivated");
              }}
              toggleLabel="Deactivate"
              hideDelete
            />
          </CoinCard>
        )}

        {/* INACTIVE */}
        {activeTab === "inactive" && (
          <CoinCard title="Inactive Coins">
            <CoinTable
              coins={filteredCoins}
              hideEdit
              hideDelete
              onToggleStatus={async (coin) => {
                await toggleCoinStatus.mutateAsync({
                  id: coin.id,
                  toggleNetworks: true,
                });
                toast.success("Coin activated");
              }}
              toggleLabel="Activate"
            />
          </CoinCard>
        )}

        {/* ADD */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Coin</DialogTitle>
            </DialogHeader>
            <CoinForm
              networks={allNetworks}
              onCancel={() => setIsAddOpen(false)}
              onSubmit={handleCreate}
              isSubmitting={createCoin.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* EDIT */}
        {editingCoin && (
          <EditCoinDialog
            open={isEditOpen}
            coin={{
              id: editingCoin.id,
              name: editingCoin.name,
              symbol: editingCoin.symbol,
              icon: editingCoin.iconUrl || "",
              isActive: !!editingCoin.isActive,
            }}
            onOpenChange={setIsEditOpen}
            onSave={(data) => handleEditSave({ id: data.id, ...data })}
            isLoading={updateCoin.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCoinsPage;
