import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFetchData } from "@/hooks/use-api";
import {
  Download,
  RefreshCw,
  TrendingUp,
  CreditCard,
  History,
  BarChart3,
  ArrowUpDown,
  Wallet,
} from "lucide-react";
import { Order, Transaction, OrderFilters, TransactionFilters } from "./types";
import StatsCards from "./StatsCards";
import Filters from "./Filters";
import OrdersSection from "./OrdersSection";
import TransactionsSection from "./TransactionsSection";
import OrderDetailsDialog from "./OrderDetailsDialog";
import TransactionDetailsDialog from "./TransactionDetailsDialog";

const TransactionsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"orders" | "transactions">(
    "orders"
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [orderFilters, setOrderFilters] = useState<OrderFilters>({});
  const [transactionFilters, setTransactionFilters] =
    useState<TransactionFilters>({});

  // Fetch orders data
  const {
    data: ordersData,
    isLoading: loadingOrders,
    error: ordersError,
    refetch: refetchOrders,
  } = useFetchData("/market/orders", ["user-orders"]);

  // Fetch transactions data
  const {
    data: transactionsData,
    isLoading: loadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useFetchData("/user/transactions", "user-transactions");

  const orders = useMemo(() => ordersData || [], [ordersData]);
  const transactions = useMemo(
    () => transactionsData?.transactions || [],
    [transactionsData]
  );

  // Calculate stats
  const stats = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status === "PENDING").length;

    const settledOrders = orders.filter((o) => o.status === "SETTLED");
    const wonOrders = settledOrders.filter((o) => o.result === "WIN");

    const totalStake = orders.reduce(
      (sum, order) => sum + Number(order.stake),
      0
    );
    const totalPnl = orders.reduce((sum, order) => {
      const stakeNum = Number(order.stake);
      const profitRateNum = Number(order.profitRate);
      if (order.result === "WIN") return sum + stakeNum * profitRateNum;
      if (order.result === "LOSS") return sum - stakeNum;
      return sum;
    }, 0);

    const totalDeposits = transactions
      .filter((t) => t.type === "DEPOSIT" && t.status === "COMPLETED")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalWithdrawals = transactions
      .filter((t) => t.type === "WITHDRAWAL" && t.status === "COMPLETED")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const pendingTransactions = transactions.filter(
      (t) => t.status === "PENDING"
    ).length;

    return {
      totalOrders: orders.length,
      activeOrders,
      totalStake,
      totalPnl,
      winRate:
        settledOrders.length > 0
          ? (wonOrders.length / settledOrders.length) * 100
          : 0,
      totalTransactions: transactions.length,
      totalDeposits,
      totalWithdrawals,
      pendingTransactions,
    };
  }, [orders, transactions]);

  // const handleExport = () => {
  //   toast({
  //     title: "Exporting data...",
  //     description: "Your transaction history is being prepared for download.",
  //   });
  // };

  const handleRefresh = () => {
    if (activeTab === "orders") {
      refetchOrders();
      toast({
        title: "Refreshing orders...",
        description: "Fetching latest order data.",
      });
    } else {
      refetchTransactions();
      toast({
        title: "Refreshing transactions...",
        description: "Fetching latest transaction data.",
      });
    }
  };

  if (ordersError || transactionsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to Load Data
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {ordersError?.message ||
                  transactionsError?.message ||
                  "An error occurred"}
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/5">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Transactions & Orders
                  </h1>
                  <p className="text-muted-foreground">
                    Track your trading orders and financial transactions
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={loadingOrders || loadingTransactions}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loadingOrders || loadingTransactions}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    loadingOrders || loadingTransactions ? "animate-spin" : ""
                  }`}
                />
                {loadingOrders || loadingTransactions ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards
            stats={stats}
            isLoading={loadingOrders || loadingTransactions}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>History</CardTitle>
                <CardDescription>
                  View your orders and transaction history
                </CardDescription>
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(v) =>
                  setActiveTab(v as "orders" | "transactions")
                }
                className="w-full sm:w-auto"
              >
                <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                  <TabsTrigger
                    value="orders"
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Orders ({orders.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="transactions"
                    className="flex items-center gap-2"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Transactions ({transactions.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <Filters
              activeTab={activeTab}
              orderFilters={orderFilters}
              transactionFilters={transactionFilters}
              onOrderFilterChange={setOrderFilters}
              onTransactionFilterChange={setTransactionFilters}
            />

            {/* Content */}
            {activeTab === "orders" ? (
              <OrdersSection
                orders={orders}
                filters={orderFilters}
                isLoading={loadingOrders}
                onOrderClick={setSelectedOrder}
              />
            ) : (
              <TransactionsSection
                transactions={transactions}
                filters={transactionFilters}
                isLoading={loadingTransactions}
                onTransactionClick={setSelectedTransaction}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      />

      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

export default TransactionsPage;
