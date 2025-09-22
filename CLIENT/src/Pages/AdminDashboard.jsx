import { Outlet } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";

function AdminDashboard() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex flex-1">
        {/* Sidebar always stays */}
        <AdminSidebar />

        {/* Main content switches via routing */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
