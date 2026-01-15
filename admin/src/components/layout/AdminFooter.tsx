import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Coins, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminFooter = () => {
  const location = useLocation();

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Home" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/coins", icon: Coins, label: "Coins" },
    { to: "/admin/trading-pairs", icon: ArrowLeftRight, label: "Pairs" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              location.pathname === item.to
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminFooter;
