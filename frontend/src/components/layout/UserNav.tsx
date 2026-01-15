import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, Wallet, FileText, ChevronLeft, Menu, FileCheck, MessageSquare, Award, User, LogOut } from "lucide-react";
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

const UserNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, removeUser } = useAuth();

  const handleLogout = () => {
    removeUser();
    navigate("/");
  };

  const menuItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/market", icon: TrendingUp, label: "Market" },
    { to: "/contract", icon: FileText, label: "Contract" },
    { to: "/wallet", icon: Wallet, label: "Wallet" },
    { to: "/kyc", icon: FileCheck, label: "KYC" },
    { to: "/transactions", icon: FileCheck, label: "Transactions" },
    { to: "/support", icon: MessageSquare, label: "Support" },
    { to: "/certificates", icon: Award, label: "Certificates" },
  ];

  return (
    <nav className="bg-card border-b border-border">
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
              <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{user?.fullName || "User Name"}</span>
                      <span className="font-medium truncate">{user?.email || "User Email"}</span>
                      <div className="w-full flex items-center gap-3">
                      <span className="text-xs text-muted-foreground truncate">VERIFICATION: {" "}</span>
                      <span className={cn("text-xs text-muted-foreground truncate border px-3 py-1 rounded-full text-white", user?.isVerified ? "border-success bg-success/50" : "border-destructive bg-destructive/30 ")}>{user?.isVerified ? "Verified" : "not verified"}</span>
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                <div className="flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar">
                  <div className="p-4 grid grid-cols-2 gap-4">
                    {/* Main Navigation */}
                    {menuItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors gap-2",
                          location.pathname === item.to && "border-primary/50 bg-primary/5"
                        )}
                      >
                        <item.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}

                    {/* Extra Links */}
                    <Link
                      to="/about"
                      className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors gap-2"
                    >
                      <span className="text-sm font-medium">About Us</span>
                    </Link>
                    <Link
                      to="/terms"
                      className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors gap-2"
                    >
                      <span className="text-sm font-medium">Terms</span>
                    </Link>

                  </div>
                  <hr className="my-4" />
                  <button
                    onClick={handleLogout}
                    className="flex p-2 w-1/2 ml-4 mb-5 items-center justify-center rounded-lg border border-border bg-card hover:bg-destructive/10 hover:text-destructive transition-colors gap-2"
                  >
                    <LogOut className="h-6 w-6" />
                    <span className="text-sm font-medium">Log out</span>
                  </button>
                </div>
              </SheetContent>
            </Sheet>

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
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium hidden md:block">Hello, {user?.name || "User"}</span>
            <span className="font-medium md:hidden text-sm">{user?.name || "User"}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNav;
