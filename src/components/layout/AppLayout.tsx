import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { AppNavbar } from "./Navbar";
import { ToastContainer } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <AppNavbar />
        <div className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          <Outlet />
        </div>
        <BottomNav />
      </main>
      <ToastContainer />
    </div>
  );
}
