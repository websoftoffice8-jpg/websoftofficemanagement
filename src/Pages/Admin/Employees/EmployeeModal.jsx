// src/components/employees/EmployeeModal.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  User,
  Lock,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  Hash,
} from "lucide-react";

// Matches the port used in EmployeeTable.jsx
const API_BASE_URL = "http://localhost:3000";

const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
  "Customer Success",
  "Sales",
];
const POSITIONS = [
  "Frontend Developer",
  "DevOps Engineer",
  "HR Specialist",
  "Financial Analyst",
  "Creative Director",
  "Operations Manager",
  "Support Tier 2",
  "Account Executive",
];

const EmployeeModal = ({ isOpen, employee, onClose, onUpdated }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({
    employeeID: "",
    name: "",
    currentPassword: "",
    newPassword: "",
    department: "",
    position: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (employee) {
      setForm({
        employeeID: employee.employeeID || "",
        name: employee.name || "",
        currentPassword: employee.password || "",
        newPassword: "",
        department: employee.department || "",
        position: employee.position || "",
      });
      setSubmitError(null);
    }
  }, [employee]);

  const departmentOptions =
    form.department && !DEPARTMENTS.includes(form.department)
      ? [form.department, ...DEPARTMENTS]
      : DEPARTMENTS;

  const positionOptions =
    form.position && !POSITIONS.includes(form.position)
      ? [form.position, ...POSITIONS]
      : POSITIONS;

  if (!isOpen || !employee) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.name.trim()) {
      setSubmitError("Employee name is required.");
      return;
    }

    const payload = {
      employeeID: form.employeeID,
      name: form.name,
      department: form.department,
      position: form.position,
      ...(form.newPassword ? { password: form.newPassword } : {}),
    };

    setIsSubmitting(true);
    try {
      const res = await axios.patch(`${API_BASE_URL}/users/${employee.id}`, payload);
      onUpdated?.(res.data);
      onClose?.();
    } catch (error) {
      console.error("Error updating employee:", error);
      setSubmitError("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-blue-600 to-blue-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Employee</h2>
            <p className="text-blue-100 text-sm">
              Update this employee's information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Employee Name
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="e.g. Sarah Mitchell"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Employee ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Employee ID
            </label>
            <div className="relative">
              <Hash
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={form.employeeID}
                onChange={handleChange("employeeID")}
                placeholder="e.g. EMP-0001"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={form.currentPassword}
                readOnly
                placeholder="Current password"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showNewPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                placeholder="Leave blank to keep current password"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Department & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={form.department}
                  onChange={handleChange("department")}
                  className="w-full appearance-none border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Position
              </label>
              <div className="relative">
                <Briefcase
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={form.position}
                  onChange={handleChange("position")}
                  className="w-full appearance-none border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {submitError && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {submitError}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;