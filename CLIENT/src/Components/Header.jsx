import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../Context/UserContext.jsx";

export default function Header() {
  const { user, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // clears user from context + localStorage
    setDropdownOpen(false);

    // Navigate to homepage AFTER state update
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 0);
  };

  const handleAvatarClick = () => setDropdownOpen(!dropdownOpen);

  return (
    <header className="bg-[#757571] px-4 shadow">
      <div className="flex items-center justify-between h-16">
     

        {/* Right side: User dropdown */}
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={handleAvatarClick}
            className="flex items-center space-x-2  p-2 px-4  focus:outline-none"
          >
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-[#b5b5b3] flex items-center justify-center text-black font-bold cursor-pointer">
              {user ? user.fullname.charAt(0).toUpperCase() : "U"}
            </div>

            {/* Welcome text */}
            <span className="hidden sm:block font-semibold text-white font-[Poppins] text-sm">
              {user ? `Welcome, ${user.fullname}` : "Welcome"}
            </span>

            {/* Dropdown arrow */}
            <svg
              className={`w-4 h-4 text-white transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              {user ? (
                <>
                  <button
                    onClick={() => alert("Go to Profile Settings")}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
