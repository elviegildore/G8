import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";
import DashboardCharts from "../Components/DashboardCharts";

function AdminDashboard() {
  const desktopSidebarWidth = "w-10";
  const location = useLocation();

  // Check if current route is exactly /Admindashboard
  const isDashboardRoot = location.pathname === "/Admindashboard";

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen ${desktopSidebarWidth} bg-white z-40`}
      >
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <main className="h-screen overflow-y-auto transition-all ml-0 md:ml-60 p-6">
        {isDashboardRoot ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <DashboardCharts />
          </>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
