import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Wallet, FileText, LogOut, FileCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { removeUser, user } = useAuth();
console.log("UserNav user:", user);
  const navItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/market", icon: TrendingUp, label: "Market" },
    { to: "/contract", icon: FileText, label: "Contract" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
    { to: "/kyc", icon: FileCheck, label: "KYC" },
    { to: "/transactions", icon: FileCheck, label: "Transactions" },
    { to: "/support", icon: MessageSquare, label: "Support" },
  ];

  // const { mutate: logout, isPending } = useCreateData(AUTH.LOGOUT, ["logout"]);
  const { toast } = useToast();

const handleLogout = () => {
  try {
    removeUser();            // clears cookies + state
    navigate("/", { replace: true });

    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    toast({
      title: "Error",
      description: "Failed to log out. Please try again.",
      variant: "destructive",
    });
  }
};

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold text-primary">
            CryptoTrade
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
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
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleLogout} >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-around py-2 border-t border-border">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
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

export default UserNav;
