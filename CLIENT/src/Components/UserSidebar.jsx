import { useState, useEffect, useRef } from "react";
import { Home, Info, FileText } from "lucide-react";

function UserSidebar() {
  const [isExpanded, setIsExpanded] = useState(false); // hover or click expanded
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Collapse sidebar if click outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const menuItems = [
    { label: "Home", href: "/userdashboard", icon: <Home size={20} /> },
    { label: "Surveys", href: "/usersurvey", icon: <FileText size={20} /> },
    { label: "Survey History", href: "/UserProgress", icon: <FileText size={20} /> },
    { label: "About", href: "/about", icon: <Info size={20} /> },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`bg-[#696969] flex flex-col h-screen transition-all duration-200 ease-in-out pt-20  shadow-lg border-3-white rounded
        ${isExpanded ? "w-64" : "w-15"}
      `}
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      {/* Sidebar Title */}
      <div className="flex items-center justify-center p-4 border-b-3 text-center">
        
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto text-white">
        {menuItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            className="flex items-center gap-2 p-3 rounded hover:bg-gray-300"
            onClick={(e) => {
              if (isMobile) {
                e.preventDefault(); // prevent navigation for demo
                setIsExpanded(true); // expand entire sidebar
              }
            }}
          >
            {item.icon}
            {isExpanded && <span>{item.label}</span>}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default UserSidebar;
