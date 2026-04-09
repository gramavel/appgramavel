import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { AdminAuthGuard } from "./components/AdminAuthGuard";

export default function AdminApp() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
