// src/layouts/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import { AdminRoute } from "@/components/AdminRoute";
import AdminNav from "./AdminNav";

const AdminLayout = () => {
  return (
    <AdminRoute>
      <AdminNav />
      <div className="admin-layout">
        <Outlet />
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;
