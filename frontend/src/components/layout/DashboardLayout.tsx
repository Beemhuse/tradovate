import { Outlet } from "react-router-dom";
import UserNav from "./UserNav";

const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* <Sidebar /> */}
      <UserNav />
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
