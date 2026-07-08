// src/components/employees/EmployeeTable.jsx

import { Pencil, Trash2 } from "lucide-react";

const dummyEmployees = [
  {
    id: "EMP001",
    name: "John Doe",
    department: "IT",
    position: "Frontend Developer",
    status: "Active",
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    department: "HR",
    position: "HR Officer",
    status: "Active",
  },
  {
    id: "EMP003",
    name: "Ram Sharma",
    department: "Finance",
    position: "Accountant",
    status: "Inactive",
  },
  {
    id: "EMP004",
    name: "Sita Karki",
    department: "Marketing",
    position: "Marketing Executive",
    status: "Active",
  },
  {
    id: "EMP005",
    name: "Hari Thapa",
    department: "IT",
    position: "Backend Developer",
    status: "Inactive",
  },
];

const EmployeeTable = ({ onEdit }) => {
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
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {dummyEmployees.map((employee) => (
              <tr
                key={employee.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {employee.id}
                </td>

                <td className="px-6 py-4">{employee.name}</td>

                <td className="px-6 py-4">{employee.department}</td>

                <td className="px-6 py-4">{employee.position}</td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(employee)}
                      className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;