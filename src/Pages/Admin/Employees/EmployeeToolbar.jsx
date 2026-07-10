// src/components/employees/EmployeeToolbar.jsx

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import PostEmployee from "./PostEmployee";

const EmployeeToolbar = ({
  search,
  setSearch,
  department,
  setDepartment,
  status,
  setStatus,
  departments = [],
  onAddEmployee,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAddEmployee = (formData) => {
    // Bubble the new employee data up to the parent (e.g. to call the API
    // or update the employees list), if a handler was passed in.
    onAddEmployee?.(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Employees
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage employee accounts and information.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-sm shadow-green-600/25 hover:bg-green-700 transition-colors"
        >
          <Plus size={17} strokeWidth={2.5} />
          Add Employee
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by name, ID, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Department - built dynamically from actual employee data,
            instead of a hardcoded list that can drift out of sync. */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Status - your data has no "status" field, so this filters
            against "role" (admin / employee / intern) instead. */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
        >
          <option value="">All Roles</option>

          <option value="employee">Employee</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      {/* Add Employee popup */}
      <PostEmployee
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
};

export default EmployeeToolbar;