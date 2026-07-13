import DashboardLayout from "../Layouts/DashboardLayout";
import { adminLinks, employeeLinks } from "../data/sidebarLinks";
import Login from "../Auth/Login";
import { createBrowserRouter, RouterProvider, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import Employee from "../Pages/Admin/Employees/Employee"
import Reports from "../Pages/Admin/Reports";
import Settings from "../Pages/Admin/Settings/Settings";



// Employee

import EmployeeDashboard from '../Pages/Employee/EmployeeDashboard'


import React from 'react'
import Attendance from "../Pages/Employee/Employee Attendance/Attendance";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Admin */}
            <Route
                element={
                    <ProtectedRoute role="admin">
                        <DashboardLayout
                            links={adminLinks}
                            userName="Admin"
                        />
                    </ProtectedRoute>
                }
            >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/employees" element={<Employee />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/settings" element={<Settings />} />
            </Route>

            {/* Employee */}
            <Route
                element={
                    <ProtectedRoute role = "employee">
                    <DashboardLayout
                        links={employeeLinks}
                        userName="John Doe"
                    />
                    </ProtectedRoute>
                }
            >
                <Route
                    path="/employee/dashboard"
                    element={<EmployeeDashboard />}
                />
                <Route
                    path="/employee/attendance"
                    element={<Attendance />}
                />
            </Route>
        </Routes>
    )
}

export default AppRoutes
