import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// User Pages
import UserLogin from "./pages/user/Login";
import UserSignup from "./pages/user/Signup";
import UserDashboard from "./pages/user/Dashboard";
import UserMarket from "./pages/user/Market";
import UserWallet from "./pages/user/Wallet";
import UserContract from "./pages/user/Contract";
import ForgotPassword from "./pages/user/ForgotPassword";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCoins from "./pages/admin/Coins";
import AdminUsers from "./pages/admin/Users";
import AdminKYC from "./pages/admin/KYC";
import AdminTransactions from "./pages/admin/Transactions";
import AdminTradingPairs from "./pages/admin/TradingPairs";
import AdminSupport from "./pages/admin/Support";
import UserKYC from "./pages/user/KYC";
import UserSupport from "./pages/user/Support";
import initAxios from "./config/config";
import VerifyMail from "./pages/user/MailVerification";

const queryClient = new QueryClient();
initAxios()

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* <AuthProvider> */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<Index />} /> */}
            
            {/* User Routes */}
            <Route path="/" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/market" element={<UserMarket />} />
            <Route path="/wallet" element={<UserWallet />} />
            <Route path="/contract" element={<UserContract />} />
            <Route path="/kyc" element={<UserKYC />} />
            <Route path="/support" element={<UserSupport />} />
            
            {/* Admin Routes */}
            {/* <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/coins" element={<AdminCoins />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/kyc" element={<AdminKYC />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/trading-pairs" element={<AdminTradingPairs />} />
            <Route path="/admin/support" element={<AdminSupport />} /> */}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    {/* </AuthProvider> */}
  </QueryClientProvider>
);

export default App;
