import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, Wallet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const UserFooter = () => {
    const location = useLocation();

    const navItems = [
        { to: "/dashboard", icon: Home, label: "Home" },
        { to: "/market", icon: TrendingUp, label: "Market" },
        { to: "/contract", icon: FileText, label: "Contract" },
        { to: "/wallet", icon: Wallet, label: "Wallet" },
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
                        <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default UserFooter;
