import UserSidebar from "../Components/UserSidebar";
import Survey from "./Survey";
import UserSurvey from "./UserSurvey";
function UserDashboard() {
  return (
    <div className="h-screen flex flex-col bg-gray-100 border-red-300">
      <div className="flex flex-1">
        <UserSidebar/>
        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <Survey />
          <UserSurvey />
        </main>
      </div>

     
    </div>
  );
}

export default UserDashboard;
