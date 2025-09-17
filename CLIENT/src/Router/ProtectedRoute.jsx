import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../Context/UserContext.jsx";

const ProtectedRoute = ({ children, role = null }) => {
  const { user } = useUser();
  const location = useLocation();

  // Only redirect if user is required
  if (!user && location.pathname !== "/") {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />; // optional: send unauthorized users home
  }

  return children;
};

export default ProtectedRoute;
