import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, Activity, BarChart3, DollarSign } from "lucide-react";
import { Stats } from "./types";

interface StatsCardsProps {
  stats: Stats;
  isLoading: boolean;
  onRefresh: () => void;
}

const StatsCards = ({ stats, isLoading, onRefresh }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Pairs</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <div className="p-2 bg-primary/20 rounded-full">
              <Coins className="h-5 w-5 text-primary" />
            </div>
          </div>
          <Progress value={100} className="h-1 mt-3" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Active Pairs</p>
              <h3 className="text-2xl font-bold">{stats.active}</h3>
              <p className="text-xs text-green-600">
                {stats.activePercentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-full">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <Progress value={stats.activePercentage} className="h-1 mt-3" />
        </CardContent>
      </Card>

      {/* <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
              <h3 className="text-2xl font-bold">
                ${stats.totalVolume.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-full">
              <BarChart3 className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
              <h3 className="text-2xl font-bold">
                ${stats.averagePrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default StatsCards;