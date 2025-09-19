import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Info, FileText, FileClock, Menu, X } from "lucide-react";

function AdminSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { label: "Home", href: "/Admindashboard", icon: <Home size={26} /> },
    { label: "Surveys", href: "/Survey", icon: <FileText size={26} /> },
    { label: "About", href: "/about", icon: <Info size={26} /> },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`h-screen bg-white flex flex-col shadow-lg transition-all duration-300 ease-in-out
        ${isMobile ? "w-16" : isExpanded ? "w-64" : "w-20"}`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        {/* Sidebar Top */}
        <div className="flex items-center justify-center p-4 border-b relative">
          {/* Show logo + title only on desktop */}
          {!isMobile && (
            <div className="flex flex-col items-center justify-center gap-2 w-full">
              <img
                src="/g8LOGO.png"
                alt="Logo"
                className="w-[50px] h-auto object-contain"
              />
              {isExpanded && (
                <span className="text-sm font-semibold tracking-widest text-black font-[Montserrat] text-center">
                  53EBG8
                </span>
              )}
            </div>
          )}

          {/* Hamburger only on mobile */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-black"
            >
              <Menu size={28} />
            </button>
          )}
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto text-black">
            {menuItems.map((item, idx) => (
              <Link
  key={idx}
  to={item.href}   // ✅ use "to" instead of "href"
  className="flex items-center gap-3 p-3 rounded hover:bg-gray-200"
>
  {item.icon}
  {isExpanded && <span>{item.label}</span>}
</Link>


            ))}
          </nav>
        )}
      </aside>

      {/* Sliding Navigation Panel (Mobile Only) */}
      {isMobile && (
        <div
          className={`fixed top-0 left-0 h-screen w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Panel Header with Logo + Title */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <img
                src="/g8LOGO.png"
                alt="Logo"
                className="w-[35px] h-auto object-contain"
              />
              <span className="text-sm font-semibold tracking-widest text-black font-[Montserrat]">
                53EBG8
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black">
              <X size={28} />
            </button>
          </div>

          {/* Panel Navigation */}
          <nav className="flex-1 p-2 space-y-2 overflow-y-auto text-black">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded hover:bg-gray-200"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Overlay when panel is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminSidebar;
