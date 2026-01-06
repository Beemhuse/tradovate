import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Wallet, FileText, LogOut, FileCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateData } from "@/hooks/use-api";
import { AUTH } from "@/hooks/apiEndpoint";
import { useToast } from "@/hooks/use-toast";

const UserNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { removeUser, user } = useAuth();

  const navItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/market", icon: TrendingUp, label: "Market" },
    { to: "/contract", icon: FileText, label: "Contract" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
    { to: "/kyc", icon: FileCheck, label: "KYC" },
    { to: "/transactions", icon: FileCheck, label: "Transactions" },
    { to: "/support", icon: MessageSquare, label: "Support" },
  ];

  const { mutate: logout, isPending } = useCreateData(AUTH.LOGOUT, ["logout"]);
  const { toast } = useToast();

  const handleLogout = async () => {
    logout({}, {
      onSuccess: () => {
        // Clear all cookies
        document.cookie.split(";").forEach((cookie) => {
          document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        // Clear local storage
        localStorage.clear();
        removeUser();
        navigate("/");
        toast({
          title: "Success",
          description: "Logged out successfully",
          variant: "default",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: (error as any)?.response?.data?.message || (error as any)?.response?.data?.error || (error as any)?.response?.data || error?.message || "Something went wrong",
          variant: "destructive",
        });
      }
    });
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
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleLogout} disabled={isPending}>
            <LogOut className="h-4 w-4 mr-2" />
            {isPending ? "Logging out..." : "Logout"}
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
