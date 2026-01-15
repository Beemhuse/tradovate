import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import NotFound from "./pages/NotFound";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin Auth
import AdminLogin from "./pages/admin/Login";
import AdminSignup from "./pages/admin/Signup";
import VerifyEmail from "./pages/admin/VerifyEmail";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCoins from "./pages/admin/Coins";
import CoinDetailsPage from "./pages/admin/CoinDetails";
import AdminUsers from "./pages/admin/Users";
import UserDetail from "./pages/admin/UserDetail";
import AdminKYC from "./pages/admin/KYC";
import AdminTransactions from "./pages/admin/Transactions";
import AdminTradingPairs from "./pages/admin/TradingPairs";
import AdminSupport from "./pages/admin/Support";
import AdminOrders from "./pages/admin/Orders";
import AdminLayout from "./components/layout/AdminLayout";
import AdminUploadCertificatesPage from "./pages/admin/Certificates";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ================= PUBLIC / AUTH ================= */}
            <Route path="/" element={<AdminLogin />} />
            <Route path="/signup" element={<AdminSignup />} />
            <Route path="/verify" element={<VerifyEmail />} />

            {/* ================= ADMIN (PROTECTED) ================= */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route
                  path="certificates"
                  element={<AdminUploadCertificatesPage />}
                />
                <Route path="coins" element={<AdminCoins />} />
                <Route path="coins/:id" element={<CoinDetailsPage />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="kyc" element={<AdminKYC />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="trading-pairs" element={<AdminTradingPairs />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="support" element={<AdminSupport />} />
              </Route>
            </Route>

            {/* ================= ERRORS ================= */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
