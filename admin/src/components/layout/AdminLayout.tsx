import { Outlet } from "react-router-dom";
import { AdminRoute } from "@/components/AdminRoute";
import AdminNav from "./AdminNav";
import AdminFooter from "./AdminFooter";

const AdminLayout = () => {
  return (
    <AdminRoute>
      <div className="flex flex-col h-screen bg-background">
        <AdminNav />
        <main className="flex-1 p-4 md:p-6 overflow-auto no-scrollbar pb-20">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </AdminRoute>
  );
};

export default AdminLayout;
