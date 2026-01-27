import AdminNav from "@/components/layout/AdminNav";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Coins, FileCheck, TrendingUp } from "lucide-react";
import { useFetchData } from "@/hooks/use-api";
import { formatDate } from "date-fns";

const AdminDashboard = () => {
  const { data, isLoading, error } = useFetchData(
    "/admin/dashboard",
    "admin-dashboard"
  );
// console.log("Dashboard data:", data);
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p className="text-destructive">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  const { metrics, activity } = data;

  const stats = [
    {
      label: "Total Users",
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      change: "", // optional: monthly delta later
      positive: true,
    },
    {
      label: "Active Coins",
      value: metrics.activeCoins,
      icon: Coins,
      change: "",
      positive: true,
    },
    {
      label: "Pending KYC",
      value: metrics.pendingKyc,
      icon: FileCheck,
      change: "",
      positive: metrics.pendingKyc === 0,
    },
    // {
    //   label: "Trading Volume",
    //   value: `$${(metrics.tradingVolume / 1_000_000).toFixed(2)}M`,
    //   icon: TrendingUp,
    //   change: "",
    //   positive: true,
    // },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of platform metrics and activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p
                    className={`text-sm ${
                      stat.positive ? "text-success" : "text-danger"
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No recent activity
                </p>
              )}

              {activity.slice(0, 5).map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  {/* <span className="text-sm text-muted-foreground">
                    {formatDate(item.time, 'MM/dd/yyyy')}
                  </span> */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
