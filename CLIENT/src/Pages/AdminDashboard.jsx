import AdminSidebar from "../Components/AdminSidebar"
import Survey from "./Survey";
function AdminDashboard() {
  return (
    <div className="h-screen flex flex-col bg-gray-100 border-red-300">
      <div className="flex flex-1">
        <AdminSidebar/>
        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <Survey />
        </main>
      </div>

     
    </div>
  );
}

export default AdminDashboard;
