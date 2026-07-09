import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (role && user.role !== role) {
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;