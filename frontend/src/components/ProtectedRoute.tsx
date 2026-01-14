import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchData } from "@/hooks/use-api";

const ProtectedRoute = () => {
  const { user, setUser } = useAuth();

  const isAuth = isAuthenticated();

  const {
    data,
    isLoading,
    isError,
  } = useFetchData(
    "/auth/me",
    "auth-me"
  );

  // 🧠 Hydrate user ONCE
  if (data && !user) {
    setUser(data);
  }

  // ❌ Not authenticated
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // ⏳ Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // ❌ Invalid token / error
  if (isError) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
