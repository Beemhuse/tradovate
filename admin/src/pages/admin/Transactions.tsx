// pages/AdminTransactions.tsx
import { useState, useMemo, useEffect } from "react";
import { Copy, ArrowRightLeft, Landmark, Zap, ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CookieManager } from "@/utils/cookie-utils";
import { API_URL } from "@/config/config";
import axios from "axios";

const AdminTransactions = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const { toast } = useToast();
  const user = CookieManager.get("tradovate-user");
  const userId = user ? JSON.parse(user).id : null;
  console.log("userId:", user);
  // Fetch transactions
  const { data, isLoading } = useFetchData(
    "/admin/transactions",
    "admin-transactions",
  );
  console.log(selectedTx);
  // Fetch transactions
  // const { data: receiptUrl, isLoading: receiptUrlLoading } = useFetchData(
  //   selectedTx?.receiptUrl ? `/market/image/${selectedTx?.raw?.user?.id}/${selectedTx?.receiptUrl}` : null,
  //   "receipt-url",
  // );

  const fetchDepositImage = async (filename: string) => {
    try {
      setIsPreviewLoading(true);
      setPreviewUrl(null);

      const token = CookieManager.get("tradovate-token");

      const response = await axios.get(
        `${API_URL}/market/image/${selectedTx?.raw?.user?.id}/${filename}`,
        {
          responseType: "blob",
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        },
      );

      const blobUrl = URL.createObjectURL(response.data);
      setPreviewUrl(blobUrl);
    } catch (err) {
      // toast``.error("Failed to load certificate image");
    } finally {
      setIsPreviewLoading(false);
    }
  };
  useEffect(() => {
    if (selectedTx?.receiptUrl) {
      fetchDepositImage(selectedTx.receiptUrl);
    }

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [selectedTx?.receiptUrl]);
  console.log("data:", previewUrl);
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
        createdAt:
          tx.createdAt ||
          tx.created_at ||
          tx.raw?.createdAt ||
          tx.raw?.created_at,
        userEmail: tx.user?.email ?? tx.raw?.user?.email ?? "-",
        userId: tx.user?.id ?? tx.raw?.user?.id ?? null,
        walletId: tx.walletId ?? tx.raw?.walletId ?? null,
        coinSymbol: tx.coin?.symbol ?? tx.raw?.coin?.symbol ?? tx.raw?.wallet?.coin?.symbol ?? "-",
        coinName: tx.coin?.name ?? tx.raw?.coin?.name ?? tx.raw?.wallet?.coin?.name ?? "-",
        networkName: tx.network?.name ?? tx.raw?.network?.name ?? tx.raw?.wallet?.network?.name ?? null,
        toAddress: tx.toAddress ?? tx.raw?.toAddress ?? null,
        raw: tx.raw ?? tx,
        adminAction: tx.adminAction ?? tx.raw?.adminAction ?? "NONE",
        receiptUrl: tx.receiptUrl ?? tx.raw?.receiptUrl ?? null,
      })),
    [transactionsRaw],
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
  >(
    (payload) => `/admin/transactions/${payload.id}/status`,
    ["admin-transactions"],
  );

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "hold",
  ) => {
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
  // // if(selectedTx)
  //     const blobUrl = URL.createObjectURL(response.data);
  //     setPreviewUrl(blobUrl);

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
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
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
                      <tr
                        key={tx.id}
                        className="border-b border-border hover:bg-secondary/50"
                      >
                        <td className="py-4 px-4 capitalize">
                          {tx.type?.replace(/_/g, " ")}
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium">{tx.userEmail}</div>
                            {/* <div className="text-xs text-muted-foreground">ID: {tx.userId}</div> */}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">
                            {tx.coinSymbol} • {tx.coinName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.networkName ?? "-"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono">
                          {Number(tx.amount).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === "completed"
                              ? "bg-success/10 text-success"
                              : tx.status === "cancelled" ||
                                tx.status === "failed"
                                ? "bg-danger/10 text-danger"
                                : "bg-primary/10 text-primary"
                              }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedTx(tx)}
                            >
                              View
                            </Button>
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
                            {tx.status !== "pending" && (
                              <div className="text-xs text-muted-foreground">
                                No actions
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
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

        {/* Details Dialog */}
        <Dialog
          open={!!selectedTx}
          onOpenChange={(open) => !open && setSelectedTx(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>

            {selectedTx && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">User Email</p>
                    <p className="font-medium">{selectedTx.userEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium uppercase">{selectedTx.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {selectedTx.amount} {selectedTx.coinSymbol}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Network</p>
                    <p className="font-medium">
                      {selectedTx.networkName || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">
                      {selectedTx.status}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(selectedTx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Crypto Withdrawal Specific Details */}
                {selectedTx.type.includes("withdraw") && selectedTx.toAddress && (
                  <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      <span className="flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3" /> Destination Wallet</span>
                      <span className="text-primary px-2 py-0.5 bg-primary/10 rounded">CRYPTO</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-xs break-all leading-relaxed text-foreground/90 selection:bg-primary/30">
                        {selectedTx.toAddress}
                      </div>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 shrink-0 hover:bg-primary hover:text-black transition-all duration-300"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTx.toAddress);
                          toast({ title: "Address copied" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Transfer / Conversion Specific Details */}
                {(selectedTx.type.includes("transfer") || selectedTx.type.includes("conversion")) && (
                  <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Asset Swap Path</span>
                      <span className="text-blue-400 px-2 py-0.5 bg-blue-400/10 rounded">SWAP</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* From Wallet */}
                      <div className="flex-1 space-y-1.5">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase italic opacity-60">Source Asset</p>
                        <div className="p-3 bg-black/40 rounded-lg border border-white/5 h-16 flex flex-col justify-center">
                          <p className="font-bold text-sm text-foreground">{selectedTx.raw?.fromCoin?.symbol || selectedTx.coinSymbol}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{selectedTx.raw?.fromNetwork?.name || selectedTx.networkName || "Mainnet"}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center px-1">
                        <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                          <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                        </div>
                      </div>

                      {/* To Wallet */}
                      <div className="flex-1 space-y-1.5 text-right">
                        <p className="text-[9px] text-muted-foreground font-bold uppercase italic opacity-60">Destination Asset</p>
                        <div className="p-3 bg-black/40 rounded-lg border border-white/5 border-l-blue-400/50 h-16 flex flex-col justify-center">
                          <p className="font-bold text-sm text-foreground">{selectedTx.raw?.toCoin?.symbol || "-"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{selectedTx.raw?.toNetwork?.name || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTx.raw?.bankName && (
                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold">Bank Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Bank Name</p>
                        <p>{selectedTx.raw.bankName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Name</p>
                        <p>{selectedTx.raw.accountName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Account Number</p>
                        <p>{selectedTx.raw.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">IFSC Code</p>
                        <p>{selectedTx.raw.ifscCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTx.receiptUrl && (
                  <div className="border-t pt-4 space-y-2">
                    <h3 className="font-semibold">Receipt</h3>
                    <div className="bg-secondary/20 rounded-lg p-2 flex justify-center overflow-hidden border">
                      {!isPreviewLoading && previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Certificate preview"
                          className="w-full max-h-[70vh] object-contain rounded"
                        />
                      )}
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={() =>
                        window.open(
                          `${import.meta.env.VITE_BASE_URL || "http://localhost:4001"}/api/v1/admin/transactions/receipts/${selectedTx.userId}/${selectedTx.receiptUrl}`,
                          "_blank",
                        )
                      }
                    >
                      Open in new tab
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedTx(null)}>
                    Close
                  </Button>
                  {selectedTx.status === "pending" && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => handleAction(selectedTx.id, "reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        className="bg-success hover:bg-success/90"
                        onClick={() => handleAction(selectedTx.id, "approve")}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTransactions;
