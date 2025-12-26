import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Coins,
  Users,
  FileCheck,
  LogOut,
  ArrowLeftRight,
  Receipt,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/coins", icon: Coins, label: "Coins" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/kyc", icon: FileCheck, label: "KYC" },
    { to: "/admin/transactions", icon: Receipt, label: "Transactions" },
    { to: "/admin/trading-pairs", icon: ArrowLeftRight, label: "Pairs" },
    // { to: "/support", icon: MessageSquare, label: "Support" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/admin/dashboard"
            className="text-2xl font-bold text-primary flex items-center gap-2"
          >
            <span className="text-foreground">Admin</span> Panel
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm",
                  location.pathname === item.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex justify-around py-2 border-t border-border overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-fit",
                location.pathname === item.to
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
