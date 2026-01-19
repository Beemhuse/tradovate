import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import initAxios from "./config/config";

// Pages
import UserLogin from "./pages/user/Login";
import UserSignup from "./pages/user/Signup";
import ForgotPassword from "./pages/user/ForgotPassword";

import UserDashboard from "./pages/user/Dashboard";
import UserWallet from "./pages/user/Wallet";
import UserContract from "./pages/user/Contract";
import TradePage from "./pages/user/Trade";
import Market from "./pages/user/Market/Market";
import TransactionsRoute from "./pages/user/Transaction";
import UserKYC from "./pages/user/KYC";
import UserSupport from "./pages/user/Support";
import UserCertificatesPage from "./pages/user/Certificates";
import BuyCrypto from "./pages/user/BuyCrypto";
import Conversion from "./pages/user/Conversion";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoutes";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Routing helpers

const queryClient = new QueryClient();
initAxios();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* 🔓 PUBLIC ROUTES */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* 🔒 PROTECTED DASHBOARD */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/market" element={<Market />} />
              <Route path="/transactions" element={<TransactionsRoute />} />
              <Route path="/wallet" element={<UserWallet />} />
              <Route path="/conversion" element={<Conversion />} />
              <Route path="/contract" element={<UserContract />} />
              <Route path="/contract/:id" element={<TradePage />} />
              <Route path="/kyc" element={<UserKYC />} />
              <Route path="/support" element={<UserSupport />} />
              <Route path="/certificates" element={<UserCertificatesPage />} />
              <Route path="/buy-crypto" element={<BuyCrypto />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
