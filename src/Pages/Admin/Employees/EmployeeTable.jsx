// src/components/employees/EmployeeTable.jsx

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import axios from "axios";
import EmployeeModal from "./EmployeeModal";

const EmployeeTable = ({
  employees = [],
  onEmployeeUpdated,
  onEmployeeDeleted,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditOpen(true);
  };

  const handleEmployeeUpdated = (updatedEmployee) => {
    // Notify the parent so the single source-of-truth list
    // (and therefore the filters) stay in sync.
    onEmployeeUpdated?.(updatedEmployee);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      onEmployeeDeleted?.(id);
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  return (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white">
          <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
            <th className="px-6 py-4">Employee ID</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Position</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees
            .filter((employee) => employee.role === "employee")
            .map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-5 text-gray-700">
                  {employee.employeeId}
                </td>

                <td className="px-6 py-5 font-medium text-gray-900">
                  {employee.name}
                </td>

                <td className="px-6 py-5 text-gray-700">
                  {employee.department}
                </td>

                <td className="px-6 py-5 text-gray-700">
                  {employee.position}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

          {employees.filter((employee) => employee.role === "employee")
            .length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-12 text-center text-gray-500"
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
