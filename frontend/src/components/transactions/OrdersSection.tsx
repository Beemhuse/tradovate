import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Order, OrderFilters } from "./types";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface OrdersSectionProps {
  orders: Order[];
  filters: OrderFilters;
  isLoading: boolean;
  onOrderClick: (order: Order) => void;
}

const OrdersSection = ({
  orders,
  filters,
  isLoading,
  onOrderClick,
}: OrdersSectionProps) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    if (
      filters.status &&
      filters.status !== "ALL" &&
      order.status !== filters.status
    ) {
      return false;
    }
    if (
      filters.result &&
      filters.result !== "ALL" &&
      order.result !== filters.result
    ) {
      return false;
    }
    if (
      filters.direction &&
      filters.direction !== "ALL" &&
      order.direction !== filters.direction
    ) {
      return false;
    }
    const period = order.tradeConfig?.period;
    if (
      filters.period &&
      filters.period !== "ALL" &&
      period !== filters.period
    ) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches =
        order.id.toLowerCase().includes(searchLower) ||
        order.marketPair.baseCoin.symbol.toLowerCase().includes(searchLower) ||
        order.marketPair.baseCoin.name.toLowerCase().includes(searchLower) ||
        order.marketPair.symbol.toLowerCase().includes(searchLower) ||
        order.stake.toString().includes(searchLower);
      if (!matches) return false;
    }
    if (filters.startDate || filters.endDate) {
      const orderDate = new Date(order.createdAt);
      if (filters.startDate && orderDate < new Date(filters.startDate))
        return false;
      if (filters.endDate && orderDate > new Date(filters.endDate))
        return false;
    }
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-3 w-3" />;
      case "SETTLED":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "SETTLED":
        return "bg-green-500/20 text-green-700 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/30";
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case "WIN":
        return "bg-green-500/20 text-green-700";
      case "LOSS":
        return "bg-red-500/20 text-red-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === "BULLISH" ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    );
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      S30: "30S",
      M1: "1M",
      M5: "5M",
      M15: "15M",
    };
    return labels[period] || period;
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">
          {orders.length === 0 ? "No orders yet" : "No matching orders found"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {orders.length === 0
            ? "Start trading to see your orders here"
            : "Try adjusting your filters"}
        </p>
        <Button onClick={() => navigate("/contract")}>Start Trading</Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Order</TableHead>
            <TableHead>Pair</TableHead>
            <TableHead>Direction/Period</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Status</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const stakeNum = Number(order.stake);
            const profitRateNum = Number(order.profitRate);
            const pnl =
              order.result === "WIN"
                ? stakeNum * profitRateNum
                : order.result === "LOSS"
                ? -stakeNum
                : 0;

            return (
              <React.Fragment key={order.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {order.id.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM dd, HH:mm")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {order.marketPair.baseCoin.iconUrl ? (
                        <img
                          src={order.marketPair.baseCoin.iconUrl}
                          alt={order.marketPair.baseCoin.symbol}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {order.marketPair.baseCoin.symbol.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {order.marketPair.baseCoin.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.marketPair.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1",
                          order.direction === "BULLISH"
                            ? "bg-green-500/10 text-green-700 border-green-500/30"
                            : "bg-red-500/10 text-red-700 border-red-500/30"
                        )}
                      >
                        {getDirectionIcon(order.direction)}
                        {order.direction}
                      </Badge>
                      <Badge variant="secondary" className="font-mono">
                        {getPeriodLabel(order.tradeConfig.period)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">${stakeNum.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      $
                      {Number(order.entryPrice).toFixed(
                        order.marketPair.baseCoin.symbol === "BTC" ? 2 : 4
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.status === "SETTLED" && order.result ? (
                      <div
                        className={cn(
                          "font-semibold",
                          order.result === "WIN"
                            ? "text-green-600"
                            : order.result === "LOSS"
                            ? "text-red-600"
                            : "text-gray-600"
                        )}
                      >
                        {order.result === "WIN" ? "+" : "-"}$
                        {Math.abs(pnl).toFixed(2)}
                        {order.result === "WIN" && (
                          <span className="text-xs ml-1">
                            (+{(profitRateNum * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-amber-600 text-sm">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Pending...
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "flex items-center gap-1",
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                      {order.result && (
                        <Badge
                          variant="secondary"
                          className={cn(getResultColor(order.result))}
                        >
                          {order.result}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {/* <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOrderClick(order)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell> */}
                </TableRow>

                {/* Expanded Details */}
                {isExpanded && (
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={8}>
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Expires At
                            </div>
                            <div className="font-medium">
                              {format(
                                new Date(order.expiresAt),
                                "MMM dd, HH:mm:ss"
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Settled At
                            </div>
                            <div className="font-medium">
                              {order.settledAt
                                ? format(
                                    new Date(order.settledAt),
                                    "MMM dd, HH:mm:ss"
                                  )
                                : "Awaiting Settlement"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Profit Rate
                            </div>
                            <div className="font-medium">
                              {profitRateNum
                                ? `${(profitRateNum * 100).toFixed(1)}%`
                                : "-"}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Network
                            </div>
                            <div className="font-medium">
                              {order.marketPair.network.name}
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-sm text-muted-foreground mb-1">
                            Trading Pair
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {order.marketPair.symbol}
                            </Badge>
                            <div className="text-sm">
                              {order.marketPair.baseCoin.name} /{" "}
                              {order.marketPair.quoteCoin.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersSection;
