import { useState } from "react";
import axios from "axios";
import ENDPOINTS from "../../../API/endpoints";
import api from "../../../API/Axios";
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

const DEPARTMENTS = ["IT", "HR", "Finance", "Marketing"];

const POSITIONS = [
  "Software Engineer",
  "HR Officer",
  "Accountant",
  "Marketing Specialist",
  "Manager",
  "Intern",
];


const PostEmployee = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    password: "",
    department: "",
    position: "",
    
  });

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(`${ENDPOINTS.EMPLOYEES}`, {
        ...form,
        role: "employee",
      });

      alert("Employee added successfully!");

      setForm({
        employeeId: "",
        name: "",
        password: "",
        department: "",
        position: "",
        
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add employee.");
    }
  };

  const handleClose = () => {
    setForm({
      employeeId: "",
      name: "",
      password: "",
      department: "",
      position: "",
      
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl shadow-slate-900/10">
        <div className="flex items-center justify-between px-6 py-5 bg-green-600">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Add Employee
            </h2>
            <p className="text-sm text-green-100">
              Create a new employee account.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white/90 hover:bg-white/15 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Employee Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute text-slate-400 -translate-y-1/2 left-3 top-1/2"
              />

              <input
                required
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="John Doe"
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Employee ID
            </label>

            <div className="relative">
              <Hash
                size={18}
                className="absolute text-slate-400 -translate-y-1/2 left-3 top-1/2"
              />

              <input
                required
                type="text"
                value={form.employeeId}
                onChange={handleChange("employeeId")}
                placeholder="EMP011"
                className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute text-slate-400 -translate-y-1/2 left-3 top-1/2"
              />

              <input
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                className="w-full py-2.5 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-slate-400 -translate-y-1/2 right-3 top-1/2 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Department
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute text-slate-400 -translate-y-1/2 left-3 top-1/2"
                />

                <select
                  required
                  value={form.department}
                  onChange={handleChange("department")}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl appearance-none text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
                >
                  <option value="">Select</option>

                  {DEPARTMENTS.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700">
                Position
              </label>

              <div className="relative">
                <Briefcase
                  size={18}
                  className="absolute text-slate-400 -translate-y-1/2 left-3 top-1/2"
                />

                <select
                  required
                  value={form.position}
                  onChange={handleChange("position")}
                  className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl appearance-none text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 focus:bg-white transition-colors"
                >
                  <option value="">Select</option>

                  {POSITIONS.map((position) => (
                    <option key={position}>{position}</option>
                  ))}
                </select>
              </div>
            </div>

             
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-xl shadow-sm shadow-green-600/25 hover:bg-green-700 transition-colors"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEmployee;