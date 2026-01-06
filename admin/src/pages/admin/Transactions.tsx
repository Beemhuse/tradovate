// pages/AdminTransactions.tsx
import { useState, useMemo } from "react";
import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFetchData, usePatchData } from "@/hooks/use-api";

const AdminTransactions = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch transactions
  const { data, isLoading } = useFetchData("/admin/transactions", "admin-transactions");

  // server returns shape: { transactions: Transaction[] }
  const transactionsRaw = data?.transactions || [];

  // Normalise / map server data to UI-friendly shape
  const transactions = useMemo(
    () =>
      transactionsRaw.map((tx: any) => ({
        id: tx.id,
        type: (tx.type || "").toLowerCase(), // e.g. 'deposit'
        amount: Number(tx.amount ?? 0),
        status: (tx.status || "").toLowerCase(), // 'pending' | 'completed' | 'cancelled'
        createdAt: tx.createdAt || tx.created_at || tx.raw?.createdAt || tx.raw?.created_at,
        userEmail: tx.user?.email ?? tx.raw?.user?.email ?? "-",
        userId: tx.user?.id ?? tx.raw?.user?.id ?? null,
        walletId: tx.walletId ?? tx.raw?.walletId ?? null,
        coinSymbol: tx.coin?.symbol ?? tx.raw?.wallet?.coin?.symbol ?? "-",
        coinName: tx.coin?.name ?? tx.raw?.wallet?.coin?.name ?? "-",
        networkName: tx.network?.name ?? tx.raw?.wallet?.network?.name ?? null,
        raw: tx.raw ?? tx,
        adminAction: tx.adminAction ?? tx.raw?.adminAction ?? "NONE",
      })),
    [transactionsRaw]
  );

  // Filter by selected status (compare lowercased)
  const filteredTransactions = transactions.filter((tx: any) => {
    if (statusFilter === "all") return true;
    return tx.status === statusFilter.toLowerCase();
  });

  // Patch endpoint using usePatchData: dynamic endpoint
  const updateStatus = usePatchData<
    any,
    { id: string; action: "approve" | "reject" | "hold" }
  >((payload) => `/admin/transactions/${payload.id}/status`, ["admin-transactions"]);

  const handleAction = async (id: string, action: "approve" | "reject" | "hold") => {
    try {
      const result = await updateStatus.mutateAsync({ id, action });
      toast({
        title: result?.frontendMessage || "Status Updated",
        description: `Transaction ${action} action completed.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transactions</h1>
          <p className="text-muted-foreground">
            Manage user deposits, withdrawals, and bank withdrawals
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <CardTitle>All Transactions</CardTitle>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Coin / Network</th>
                      <th className="text-right py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b border-border hover:bg-secondary/50">
                        <td className="py-4 px-4 capitalize">{tx.type?.replace(/_/g, " ")}</td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{tx.userEmail}</div>
                            {/* <div className="text-xs text-muted-foreground">ID: {tx.userId}</div> */}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{tx.coinSymbol} • {tx.coinName}</div>
                          <div className="text-xs text-muted-foreground">{tx.networkName ?? "-"}</div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono">{Number(tx.amount).toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === "completed"
                                ? "bg-success/10 text-success"
                                : tx.status === "cancelled" || tx.status === "failed"
                                ? "bg-danger/10 text-danger"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {tx.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-success"
                                  onClick={() => handleAction(tx.id, "approve")}
                                  disabled={updateStatus.isPending}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-warning"
                                  onClick={() => handleAction(tx.id, "hold")}
                                  disabled={updateStatus.isPending}
                                >
                                  Hold
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-danger"
                                  onClick={() => handleAction(tx.id, "reject")}
                                  disabled={updateStatus.isPending}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {tx.status !== "pending" && <div className="text-xs text-muted-foreground">No actions</div>}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTransactions;
