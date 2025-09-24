import { Routes, Route, Navigate } from "react-router-dom";
import { useUser } from "../Context/UserContext.jsx";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../Layout/MainLayout";
import HomePage from "../Pages/HomePage";
import About from "../Pages/About";
import Login from "../Pages/Login";
import Register from "../Pages/Register";
import AdminDashboard from "../Pages/AdminDashboard";
import UserDashboard from "../Pages/UserDashboard";
import Survey from "../Pages/Survey.jsx";
import ManageSurvey from "../Pages/ManageSurvey.jsx"
import ManageAdmin from "../Pages/ManageAdmin.jsx";
import ManageUser from "../Pages/ManageUser.jsx";
import ManageResponse from "../Pages/ManageResponse.jsx";


const Routers = () => {
  const { user } = useUser();

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="about" element={<About />} />

        {/* Login & Register */}
        <Route
          path="login"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admindashboard" : "/userdashboard"}
                replace
              />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="register"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admindashboard" : "/userdashboard"}
                replace
              />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="Admindashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="userdashboard"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="admindashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>}>


            {/* Default dashboard content */}
            <Route index element={<h1 className="text-2xl font-bold">Dashboard</h1>} />

            {/* Nested pages */}
            <Route path="survey" element={<Survey />} />
            <Route path="managesurvey" element={<ManageSurvey/>} />
            <Route path="manageadmin" element={<ManageAdmin />} />
            <Route path="manageuser" element={<ManageUser/>} />
            <Route path="manageresponse" element={<ManageResponse />} />
            </Route>

        </Route>
    </Routes>
  );
};

export default Routers;
