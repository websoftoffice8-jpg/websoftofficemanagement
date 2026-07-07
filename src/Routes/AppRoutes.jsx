import { Routes, Route } from "react-router-dom";

// Auth
import Login from "../Auth/Login";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import Employees from "../Pages/Admin/Employees";
import Reports from "../Pages/Admin/Reports";
import Settings from "../Pages/Admin/Settings";

// Employee
import Attendance from "../Pages/Employee/Attendance";
import EmployeeDashboard from "../Pages/Employee/EmployeeDashboard";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Authentication */}
      <Route path="/" element={<Login />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/employees" element={<Employees />} />
      <Route path="/admin/reports" element={<Reports />} />
      <Route path="/admin/settings" element={<Settings />} />

      {/* Employee */}
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/attendance" element={<Attendance />} />

    </Routes>
  )
}

export default AppRoutes;
