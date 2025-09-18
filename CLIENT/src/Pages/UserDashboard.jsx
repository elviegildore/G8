import UserMain from "../Components/UserMain";
import UserSidebar from "../Components/UserSidebar";
function UserDashboard() {
  return (
    <div className="h-screen flex flex-col bg-gray-100 border-red-300">
      <div className="flex flex-1">
        <UserSidebar/>
        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <UserMain />
        </main>
      </div>

     
    </div>
  );
}

export default UserDashboard;
