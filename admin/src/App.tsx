import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCoins from "./pages/admin/Coins";
import AdminUsers from "./pages/admin/Users";
import UserDetail from "./pages/admin/UserDetail";
import AdminKYC from "./pages/admin/KYC";
import AdminTransactions from "./pages/admin/Transactions";
import AdminTradingPairs from "./pages/admin/TradingPairs";
import AdminSupport from "./pages/admin/Support";
import AdminSignup from "./pages/admin/Signup";
import VerifyEmail from "./pages/admin/VerifyEmail";
import CoinDetail from "./pages/user/CoinDetail";
import CoinDetailsPage from "./pages/admin/CoinDetails";
import Market from "./pages/user/Market";
import MarketPairs from "./pages/user/MarketPairs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/market/:id" element={<Market />} />
            <Route path="/market-pairs" element={<MarketPairs />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/signup" element={<AdminSignup />} />
            <Route path="/verify" element={<VerifyEmail />} />

            {/* Admin-Only Routes */}
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/coins"
              element={
                <AdminRoute>
                  <AdminCoins />
                </AdminRoute>
              }
            />
            <Route path="/coin/:id" element={<CoinDetailsPage />} />

            <Route
              path="/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/users/:id"
              element={
                <AdminRoute>
                  <UserDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/kyc"
              element={
                <AdminRoute>
                  <AdminKYC />
                </AdminRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <AdminRoute>
                  <AdminTransactions />
                </AdminRoute>
              }
            />
            <Route
              path="/trading-pairs"
              element={
                <AdminRoute>
                  <AdminTradingPairs />
                </AdminRoute>
              }
            />
            <Route
              path="/support"
              element={
                <AdminRoute>
                  <AdminSupport />
                </AdminRoute>
              }
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Coin detail (public) */}

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
