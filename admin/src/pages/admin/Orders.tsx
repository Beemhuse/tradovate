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
import { useFetchData, useCreateData } from "@/hooks/use-api";
import { Trophy, XCircle, Clock, CheckCircle2 } from "lucide-react";

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  // Fetch orders
  const { data, isLoading } = useFetchData("/admin/orders", "admin-orders");
  const ordersRaw = data?.orders || [];

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return ordersRaw;
    return ordersRaw.filter((order: any) => order.status === statusFilter);
  }, [ordersRaw, statusFilter]);

  // Settlement Mutation
  const settleOrder = useCreateData<
    any,
    { result: "WIN" | "LOSS"; id: string }
  >((payload) => `/admin/orders/${payload.id}/settle`, ["admin-orders"]);

  const handleSettle = async (id: string, result: "WIN" | "LOSS") => {
    try {
      await settleOrder.mutateAsync({ id, result });
      toast({
        title: "Order Settled",
        description: `Order marked as ${result} successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Settlement Failed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-warning" />;
      case "SETTLED":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    if (!result) return null;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          result === "WIN"
            ? "bg-success/10 text-success"
            : "bg-danger/10 text-danger"
        }`}
      >
        {result}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-muted-foreground">
              Monitor user trades and manually settle pending orders.
            </p>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SETTLED">Settled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Loading orders...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left py-4 px-6">User</th>
                      <th className="text-left py-4 px-6">Pair</th>
                      <th className="text-left py-4 px-6">Direction</th>
                      <th className="text-right py-4 px-6">Stake</th>
                      <th className="text-left py-4 px-6">Price</th>
                      <th className="text-center py-4 px-6">Status</th>
                      <th className="text-center py-4 px-6">Result</th>
                      <th className="text-right py-4 px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order: any) => (
                      <tr
                        key={order.id}
                        className="border-b border-border hover:bg-secondary/20 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium">
                            {order.user?.email}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {order.id.split("-")[0]}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold uppercase">
                            {order.marketPair?.baseCoin?.symbol}/
                            {order.marketPair?.quoteCoin?.symbol}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={
                              order.direction === "BULLISH"
                                ? "text-success"
                                : order.direction === "BEARISH"
                                ? "text-danger"
                                : ""
                            }
                          >
                            {order.direction}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono">
                          {Number(order.stake).toLocaleString()} USDT
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">
                          {Number(order.entryPrice).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getResultBadge(order.result)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {order.status === "PENDING" ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-success text-success hover:bg-success hover:text-white"
                                onClick={() => handleSettle(order.id, "WIN")}
                                disabled={settleOrder.isPending}
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                Win
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-danger text-danger hover:bg-danger hover:text-white"
                                onClick={() => handleSettle(order.id, "LOSS")}
                                disabled={settleOrder.isPending}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Loss
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Settled on{" "}
                              {new Date(order.settledAt).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-12 text-center text-muted-foreground"
                        >
                          No orders found matching this filter.
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

export default AdminOrders;
