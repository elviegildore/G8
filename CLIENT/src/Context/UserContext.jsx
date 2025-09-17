import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const fullname = localStorage.getItem("fullname");
    const serial_number = localStorage.getItem("serial_number");
    const role = localStorage.getItem("role");
    return fullname ? { fullname, serial_number, role } : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("fullname", userData.fullname);
    localStorage.setItem("serial_number", userData.serial_number);
    localStorage.setItem("role", userData.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fullname");
    localStorage.removeItem("serial_number");
    localStorage.removeItem("role");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook
export const useUser = () => useContext(UserContext);
