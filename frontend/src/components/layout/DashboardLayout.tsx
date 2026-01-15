import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import UserNav from "./UserNav";
import UserFooter from "./UserFooter";
import { useFetchData } from "@/hooks/use-api";
import { AUTH } from "@/hooks/apiEndpoint";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLayout = () => {

  const { setUser, setLoading } = useAuth();

  const {
    data: meData,
    isLoading: meLoading,
  } = useFetchData(AUTH.ME, "me");

  console.log("meData", meData);

  useEffect(() => {
    setLoading(meLoading);
    if (meData) {
      setUser(meData);
      console.log("meData", meData);
    }
  }, [meData, meLoading, setUser, setLoading]);

  if (meLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* <Sidebar /> */}
      <UserNav />
      <main className="flex-1 p-4 md:p-6 overflow-auto no-scrollbar">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
};

export default DashboardLayout;
