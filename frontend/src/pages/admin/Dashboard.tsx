import AdminNav from "@/components/layout/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coins, FileCheck, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const stats = [
    { label: "Total Users", value: "1,247", icon: Users, change: "+12.5%", positive: true },
    { label: "Active Coins", value: "24", icon: Coins, change: "+2", positive: true },
    { label: "Pending KYC", value: "38", icon: FileCheck, change: "-5", positive: true },
    { label: "Trading Volume", value: "$2.4M", icon: TrendingUp, change: "+18.2%", positive: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of platform metrics and activities</p>
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
                <p className={`text-sm ${stat.positive ? "text-success" : "text-danger"}`}>
                  {stat.change} from last month
                </p>
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
              {[
                { action: "New user registered", user: "john.doe@example.com", time: "2 minutes ago" },
                { action: "KYC submitted", user: "jane.smith@example.com", time: "15 minutes ago" },
                { action: "Withdrawal request", user: "mike.wilson@example.com", time: "1 hour ago" },
                { action: "New deposit", user: "sarah.jones@example.com", time: "2 hours ago" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.user}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
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
