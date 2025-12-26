import React, { useState, useEffect } from "react";
import AdminNav from "@/components/layout/AdminNav";
import CoinCard from "@/components/coin-management/coin-card";
import CoinTable from "@/components/coin-management/coin-table";
import DeleteConfirmationModal from "@/components/coin-management/delete-confirmation-modal";
import EditCoinDialog from "@/components/coin-management/edit-coin-dialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFetchData,
  useCreateData,
  useDeleteData,
  useUpdateData,
} from "@/hooks/use-api";
import { HARDCODED_NETWORKS } from "@/constants/networks";
import {
  Coin,
  CreateCoinPayload,
  UpdateCoinPayload,
  Network,
} from "@/types/coins";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CoinForm from "@/components/coin-management/coin-form";

const AdminCoinsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: networksData } = useFetchData<{
    success: boolean;
    count: number;
    networks: Network[];
  }>("/admin/networks", "admin-networks");
  const allNetworks = networksData?.networks || HARDCODED_NETWORKS;

  const {
    data: coinsData,
    isLoading,
    isError,
    refetch,
  } = useFetchData<{ success: boolean; count: number; coins: Coin[] }>(
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
  const deactivateCoin = useDeleteData<void>(
    (id: string | number) => `/admin/coins/${id}/deactivate`,
    ["admin-coins"]
  );
  const deleteCoin = useDeleteData<void>(
    (id: string | number) => `/admin/coins/${id}?force=true`,
    ["admin-coins"]
  );

  // UI state
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCoin, setEditingCoin] = useState<Coin | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [coinToDelete, setCoinToDelete] = useState<Coin | null>(null);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-coins"] });
  }, [activeTab, queryClient]);

  const filteredCoins = coins.filter(
    (c) => !!c.isActive === (activeTab === "active")
  );

  const handleCreate = async (payload: CreateCoinPayload) => {
    try {
      await createCoin.mutateAsync(payload);
      toast.success(
        payload.networkName ? "Coin created and linked" : "Coin created"
      );
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-coins"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to create coin");
      console.error(err);
    }
  };

  const handleEditSave = async (data: UpdateCoinPayload) => {
    try {
      await updateCoin.mutateAsync(data);
      toast.success("Coin updated");
      setIsEditOpen(false);
      setEditingCoin(null);
      queryClient.invalidateQueries({ queryKey: ["admin-coins"] });
    } catch (err: any) {
      toast.error("Failed to update coin");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!coinToDelete) return;
    try {
      if (coinToDelete._count?.wallets || coinToDelete._count?.orders) {
        await deactivateCoin.mutateAsync(coinToDelete.id);
        toast.success("Coin deactivated");
      } else {
        await deleteCoin.mutateAsync(coinToDelete.id);
        toast.success("Coin deleted");
      }
      setIsDeleteOpen(false);
      setCoinToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-coins"] });
    } catch (err: any) {
      toast.error("Failed to delete/deactivate coin");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </div>
    );
  if (isError)
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          Error loading coins <button onClick={() => refetch()}>Retry</button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coin Management</h1>
            <p className="text-muted-foreground">Total: {coins.length}</p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button onClick={() => setIsAddOpen(true)}>Add New Coin</Button>
          </div>
        </div>

        <CoinCard
          title={`${activeTab === "active" ? "Active" : "Inactive"} Coins`}
        >
          <CoinTable
            coins={filteredCoins}
            onToggleStatus={async (coin) =>
              await updateCoin.mutateAsync({
                id: coin.id,
                data: { isActive: !coin.isActive },
              })
            }
            onEdit={(coin) => {
              setEditingCoin(coin);
              setIsEditOpen(true);
            }}
            onDelete={(coin) => {
              setCoinToDelete(coin);
              setIsDeleteOpen(true);
            }}
          />
        </CoinCard>

        {/* Add Coin Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <CoinForm
            networks={allNetworks}
            onCancel={() => setIsAddOpen(false)}
            onSubmit={handleCreate}
            isSubmitting={createCoin.isPending}
          />
        </Dialog>

        {/* Edit Dialog */}
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

        {/* Delete Confirmation */}
        <DeleteConfirmationModal
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onConfirm={handleDeleteConfirm}
          title={
            coinToDelete?._count?.wallets || coinToDelete?._count?.orders
              ? "Deactivate Coin"
              : "Delete Coin"
          }
          description={
            coinToDelete?._count?.wallets || coinToDelete?._count?.orders
              ? "This coin has active wallets or orders. It will be deactivated."
              : "Permanently delete this coin."
          }
          itemName={
            coinToDelete ? `${coinToDelete.name} (${coinToDelete.symbol})` : ""
          }
          hasNetworks={
            !!coinToDelete?.networks && coinToDelete.networks.length > 0
          }
          networkCount={coinToDelete?.networks?.length || 0}
          isLoading={deleteCoin.isPending || deactivateCoin.isPending}
        />
      </div>
    </div>
  );
};

export default AdminCoinsPage;
