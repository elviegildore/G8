import React from "react";
import UserSidebar from "../Components/UserSidebar";
import UserMain from "../Components/UserMain";
import Footer from "../Components/Footer";

function UserDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 border-red-300">
      {/* Page content (sidebar + main) */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <UserSidebar />

        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <UserMain />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default UserDashboard;
