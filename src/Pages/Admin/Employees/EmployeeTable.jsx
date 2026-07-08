// src/components/employees/EmployeeTable.jsx

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import EmployeeModal from "./EmployeeModal";

const EmployeeTable = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get("http://localhost:3000/users");
            setEmployees(res.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleEdit = (employee) => {
        setSelectedEmployee(employee);
        setIsEditOpen(true);
    };

    const handleEmployeeUpdated = (updatedEmployee) => {
        // Swap in the updated record immediately, no need to re-fetch everything.
        setEmployees((prev) =>
            prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp))
        );
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:3000/users/${id}`);

            // Option 1: Fetch data again
            fetchEmployees();

            // Option 2 (faster):
            // setEmployees((prev) => prev.filter((emp) => emp.id !== id));

        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr className="text-left text-gray-600 text-sm">
                            <th className="px-6 py-4">Employee ID</th>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Department</th>
                            <th className="px-6 py-4">Position</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {employees.map((employee) => (
                            <tr
                                key={employee.id}
                                className="border-t hover:bg-gray-50 transition"
                            >
                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {employee.employeeID}
                                </td>

                                <td className="px-6 py-4">{employee.name}</td>

                                <td className="px-6 py-4">{employee.department}</td>

                                <td className="px-6 py-4">{employee.position}</td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-3">
                                        <button
                                            onClick={() => handleEdit(employee)}
                                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {employees.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <EmployeeModal
                isOpen={isEditOpen}
                employee={selectedEmployee}
                onClose={() => setIsEditOpen(false)}
                onUpdated={handleEmployeeUpdated}
            />
        </div>
    );
};

export default EmployeeTable;