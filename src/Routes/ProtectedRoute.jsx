import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const userString = localStorage.getItem("user");

  if (!userString) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userString);
  } catch {
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (!user.role) {
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;