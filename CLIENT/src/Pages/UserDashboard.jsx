import UserSidebar from "../Components/UserSidebar";
import {Outlet} from "react-router-dom"

function UserDashboard() {
  const desktopSidebarWidth = "w-60";

  return (
   <div className="h-screen flex">
      {/** SIDEBAR */}

      <div className={`fixed top-0 left-0 h-screen ${desktopSidebarWidth} bg-white z-40`}>
          <UserSidebar />
      </div>

      {/** MAIN CONTENT */}
      <main className={`h-screen overflow-y-auto transition-all ml-0 md:ml-64`}>
        <Outlet />
      </main>

   </div>
  );
}

export default UserDashboard;
