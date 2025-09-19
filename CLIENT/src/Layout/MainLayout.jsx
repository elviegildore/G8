import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen">

      {/* Right column: Header, Content, Footer stacked */}
      <div className="flex flex-col flex-1">
        {/* Header stays at the top but only in right side */}
        <div className="bg-white shadow">
          <Header />
        </div>

        {/* Main content takes the remaining space */}
        <main className="flex-1 p-4 overflow-auto bg-gray-50">
          <Outlet />
        </main>

        {/* Footer only in right side */}
        <div className="bg-white shadow">
          <Footer />
        </div>
      </div>
    </div>
  );
}
