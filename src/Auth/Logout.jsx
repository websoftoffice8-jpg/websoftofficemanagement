import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove stored user data
    localStorage.removeItem("user");

    // If you store anything else
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");

    // Redirect to login
    navigate("/", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default LogoutButton;