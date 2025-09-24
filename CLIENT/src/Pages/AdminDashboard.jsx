import { Outlet } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";

function AdminDashboard() {
  const desktopSidebarWidth = "w-3"; // sidebar width (20rem)

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen ${desktopSidebarWidth} bg-white z-40`}
      >
        <AdminSidebar />
      </div>

      {/* Main content */}
      <main
        className={`
          h-screen overflow-y-auto transition-all
          ml-0 md:ml-60`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AdminDashboard;
