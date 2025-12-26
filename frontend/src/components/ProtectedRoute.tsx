import { isAuthenticated } from "@/utils/auth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
