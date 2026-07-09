import DashboardLayout from "../Layouts/DashboardLayout";
import { adminLinks, employeeLinks } from "../data/sidebarLinks";
import Login from "../Auth/Login";
import { createBrowserRouter, RouterProvider, Routes, Route } from 'react-router-dom';

// Admin
import AdminDashboard from "../pages/admin/Dashboard"; 
import Employee from "../Pages/Admin/Employees/Employee"
import Reports from "../Pages/Admin/Reports"; 
import Settings from "../Pages/Admin/Settings/Settings";



// Employee
import Attendance from "../Pages/Employee/Attendance"; 
import EmployeeDashboard from '../Pages/Employee/EmployeeDashboard'


import React from 'react'

const AppRoutes = () => {
    return ( 
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Admin */}
            <Route
                element={
                    <DashboardLayout
                        links={adminLinks}
                        userName="admin"
                    />
                }
            >
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/employees" element={<Employee />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/settings" element={<Settings/>} />
                
                
            </Route>

            {/* Employee */}
            <Route
                element={
                    <DashboardLayout
                        links={employeeLinks}
                        userName="John Doe"
                    />
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
