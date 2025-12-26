// pages/AdminUsers.tsx
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, Search, Eye, UserX } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useFetchData, usePatchData } from "@/hooks/use-api";
import KycBadge from "@/components/users/kyc-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// --- Types (adjust if your API returns different fields) ---
type Coin = {
  id: string;
  symbol?: string;
  name?: string;
  iconUrl?: string | null;
  isActive?: boolean;
};

type Wallet = {
  id: string;
  balance: number;
  coin?: Coin | null;
};

type Transaction = {
  id: string;
  amount: number;
  type?: string;
  createdAt: string;
};

type User = {
  id: string;
  email: string;
  isVerified: boolean;
  suspended: boolean;
  role?: string;
  createdAt: string;
  updatedAt?: string;
  kycStatus?: string;
  wallets?: Wallet[];
  transactions?: Transaction[];
  totalBalance?: number; // backend should include this
  name?: string;
};

// --- Helper to format currency ---
const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value ?? 0
  );

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Modals state
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionReason, setActionReason] = useState("");

  // Change this endpoint string if your backend route is different.
  const endpoint = "/admin/users";
  const {
    data: users,
    error,
    isLoading,
  } = useFetchData<{ users: User[] }>(endpoint, "adminUsers");

  // Patch hooks
  // Suspend hook -> PATCH /admin/users/:id/suspend
  const suspendUser = usePatchData<
    any,
    { id: string; suspend: boolean; reason?: string }
  >((payload) => `/admin/users/${payload.id}/suspend`, ["adminUsers"]);

  // Disable KYC hook -> PATCH /admin/users/:id/kyc (adjust if your backend differs)
  const disableKyc = usePatchData<
    any,
    { id: string; action: "disable"; reason?: string }
  >((payload) => `/admin/users/${payload.id}/kyc`, ["adminUsers"]);

  // derive filtered list
  const filteredUsers = useMemo(() => {
    const list = users?.users ?? [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => {
      const name = (u as any).name ?? "";
      return (
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (name && name.toLowerCase().includes(q))
      );
    });
  }, [users, searchTerm]);

  // helper: compute total balance from wallets (sum of wallet.balance)
  const getUserBalance = (u: User) => {
    if (typeof u.totalBalance === "number") return u.totalBalance;
    if (!u.wallets || u.wallets.length === 0) return 0;
    return u.wallets.reduce((acc, w) => acc + (w.balance ?? 0), 0);
  };

  // Open suspend modal
  const openSuspend = (u: User) => {
    setSelectedUser(u);
    setActionReason("");
    setSuspendOpen(true);
  };

  // Confirm suspend
  const confirmSuspend = async (suspend: boolean) => {
    if (!selectedUser) return;
    try {
      await suspendUser.mutateAsync({
        id: selectedUser.id,
        suspend,
        reason: actionReason || undefined,
      });
      toast({
        title: suspend ? "User suspended" : "User unsuspended",
        description: undefined,
        type: "success",
      });
      setSuspendOpen(false);
      setSelectedUser(null);
      setActionReason("");
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.message || "Could not update suspension",
        type: "error",
      });
    }
  };

  // Open disable KYC modal
  const openDisableKyc = (u: User) => {
    setSelectedUser(u);
    setActionReason("");
    setKycOpen(true);
  };

  // Confirm disable KYC
  const confirmDisableKyc = async () => {
    if (!selectedUser) return;
    try {
      await disableKyc.mutateAsync({
        id: selectedUser.id,
        action: "disable",
        reason: actionReason || undefined,
      });
      toast({
        title: "KYC disabled",
        description: "User KYC has been disabled",
        type: "success",
      });
      setKycOpen(false);
      setSelectedUser(null);
      setActionReason("");
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err?.message || "Could not disable KYC",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage registered users and their accounts
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Loading users...
                </div>
              ) : error ? (
                <div className="p-6 text-center text-sm text-destructive">
                  Failed to load users: {error.message}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Verification</th>
                      <th className="text-left py-3 px-4">Suspended</th>
                      <th className="text-left py-3 px-4">Kyc Status</th>
                      <th className="text-right py-3 px-4">Balance</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-6 px-4 text-center text-sm text-muted-foreground"
                        >
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const displayName =
                          (user as any).name ?? user.email.split("@")[0];
                        const status = user.role ?? "USER";
                        const balance = getUserBalance(user);
                        return (
                          <tr
                            key={user.id}
                            className="border-b border-border hover:bg-secondary/50"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{displayName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isVerified
                                    ? "bg-success/10 text-success"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isVerified
                                    ? "bg-success/10 text-success"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {user.isVerified ? "Verified" : "Unverified"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  !user.suspended
                                    ? "bg-success/10 text-success"
                                    : "bg-danger/10 text-danger"
                                }`}
                              >
                                {user.suspended ? "Suspended" : "Active"}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <KycBadge status={user.kycStatus} />
                            </td>
                            <td className="py-4 px-4 text-right font-semibold">
                              {formatCurrency(balance)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link to={`/users/${user.id}`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-primary"
                                  title="Disable KYC"
                                  onClick={() => openDisableKyc(user)}
                                >
                                  <UserX className="h-4 w-4" />
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger"
                                  title="Suspend user"
                                  onClick={() => openSuspend(user)}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspend Modal */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? `Suspend ${selectedUser.email}` : "Suspend user"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Reason (optional)</Label>
            <Textarea
              value={actionReason}
              onChange={(e: any) => setActionReason(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Suspending will prevent the user from logging in. You can
              unsuspend later.
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-4">
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSuspendOpen(false);
                  setSelectedUser(null);
                  setActionReason("");
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => confirmSuspend(false)}
                disabled={suspendUser.isPending}
              >
                Unsuspend
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmSuspend(true)}
                disabled={suspendUser.isPending}
              >
                {suspendUser.isPending ? "Processing..." : "Suspend user"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable KYC Modal */}
      <Dialog open={kycOpen} onOpenChange={setKycOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser
                ? `Disable KYC for ${selectedUser.email}`
                : "Disable KYC"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Reason (optional)</Label>
            <Textarea
              value={actionReason}
              onChange={(e: any) => setActionReason(e.target.value)}
            />
            <div className="text-sm text-muted-foreground">
              Disabling KYC will mark the user's KYC as disabled/rejected. Use
              when documents are invalid.
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-4">
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setKycOpen(false);
                  setSelectedUser(null);
                  setActionReason("");
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={confirmDisableKyc}
                disabled={disableKyc.isPending}
              >
                {disableKyc.isPending ? "Processing..." : "Disable KYC"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
