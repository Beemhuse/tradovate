import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchData } from "@/hooks/use-api";
import { useEffect } from "react";
import { CookieManager } from "@/utils/cookie-utils";

const ProtectedRoute = () => {
  const { user, setUser } = useAuth();

  const {
    data,
    isLoading,
    isError,
  } = useFetchData("/auth/me", "auth-me");
CookieManager.set("tradovate-user", JSON.stringify(data), {
    expires: 7, 
});
  // 🧠 Hydrate user safely
  useEffect(() => {
    if (data && !user) {
      setUser(data);
    }
  }, [data, user, setUser]);

  // ⏳ Wait for auth bootstrap
  if (isLoading || (!user && !isError)) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ❌ Not logged in / token invalid
  if (isError || !user) {
    return <Navigate to="/" replace />;
  }

  // ❌ Logged in but NOT admin
  if (user.role !== "ADMIN") {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Admin allowed
  return <Outlet />;
};

export default ProtectedRoute;
