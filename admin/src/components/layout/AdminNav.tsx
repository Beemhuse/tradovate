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
  ClipboardList,
  Menu,
  ChevronLeft,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const AdminNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/coins", icon: Coins, label: "Coins" },
    { to: "/admin/trading-pairs", icon: ArrowLeftRight, label: "Pairs" },
    { to: "/admin/orders", icon: ClipboardList, label: "Orders" },
    { to: "/admin/transactions", icon: Receipt, label: "Transactions" },
    { to: "/admin/kyc", icon: FileCheck, label: "KYC" },
    { to: "/admin/support", icon: MessageSquare, label: "Support" },
    { to: "/admin/certificates", icon: FileCheck, label: "Certificates" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] p-0 flex flex-col"
              >
                <SheetHeader className="p-6 border-b border-border text-left">
                  <SheetTitle>Admin Menu</SheetTitle>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col overflow-hidden text-left">
                      <span className="font-medium truncate">
                        {user?.fullName || "Administrator"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user?.email || "Full Access"}
                      </span>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors gap-2",
                          location.pathname === item.to &&
                            "border-primary/50 bg-primary/5 text-primary"
                        )}
                      >
                        <item.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-border">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-10 w-24 relative hidden md:block">
                <img
                  src="/tradovate_logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="h-8 w-20 relative md:hidden">
                <img
                  src="/tradovate_logo.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium hidden md:block">
              Hello, {user?.fullName?.split(" ")[0] || "Admin"}
            </span>
            <span className="font-medium md:hidden text-sm">
              {user?.fullName?.split(" ")[0] || "Admin"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNav;
