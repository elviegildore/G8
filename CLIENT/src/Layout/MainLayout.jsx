import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Header - fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white shadow">
        <Header />
      </div>

      {/* Main content */}
      <main className="pt-16 p-4 bg-gray-50">
        <Outlet />
      </main>

      {/* Footer - not fixed */}
      <Footer />
    </div>
  );
}
