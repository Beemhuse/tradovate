import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, DollarSign, Percent, Wallet, CreditCard, Activity, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stats } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats: Stats;
  isLoading: boolean;
}

const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      description: "All time orders",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      description: "Currently running",
    },
    {
      title: "Total Stake",
      value: `$${stats.totalStake.toFixed(2)}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      description: "Total invested",
    },
    {
      title: "Win Rate",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      description: "Success rate",
    },
    {
      title: "Total P&L",
      value: `$${stats.totalPnl.toFixed(2)}`,
      icon: Trophy,
      color: stats.totalPnl >= 0 ? "text-green-600" : "text-red-600",
      bgColor: stats.totalPnl >= 0 ? "bg-green-500/10" : "bg-red-500/10",
      borderColor: stats.totalPnl >= 0 ? "border-green-500/20" : "border-red-500/20",
      description: "Profit & Loss",
    },
    {
      title: "Total Deposits",
      value: `$${stats.totalDeposits.toFixed(2)}`,
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      description: "All time deposits",
    },
    {
      title: "Total Withdrawals",
      value: `$${stats.totalWithdrawals.toFixed(2)}`,
      icon: Wallet,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      description: "All time withdrawals",
    },
    {
      title: "Pending",
      value: stats.pendingTransactions,
      icon: Activity,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      description: "Pending transactions",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={index} 
          className={cn("border", stat.borderColor)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className={cn("text-2xl font-bold", stat.color)}>
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className={cn("p-2 rounded-full", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;