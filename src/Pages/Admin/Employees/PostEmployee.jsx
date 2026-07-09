import { useState } from "react";
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
      await axios.post("http://localhost:3000/users", {
        ...form,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden bg-white border rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 bg-blue-600 border-b">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Add Employee
            </h2>
            <p className="text-sm text-blue-100">
              Create a new employee account.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Employee Name
            </label>

            <div className="relative">
              <User
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />

              <input
                required
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="John Doe"
                className="w-full py-2.5 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Employee ID
            </label>

            <div className="relative">
              <Hash
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />

              <input
                required
                type="text"
                value={form.employeeId}
                onChange={handleChange("employeeId")}
                placeholder="EMP011"
                className="w-full py-2.5 pl-10 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />

              <input
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                className="w-full py-2.5 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Department
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                />

                <select
                  required
                  value={form.department}
                  onChange={handleChange("department")}
                  className="w-full py-2.5 pl-10 pr-4 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select</option>

                  {DEPARTMENTS.map((dept) => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Position
              </label>

              <div className="relative">
                <Briefcase
                  size={18}
                  className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
                />

                <select
                  required
                  value={form.position}
                  onChange={handleChange("position")}
                  className="w-full py-2.5 pl-10 pr-4 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="px-5 py-2.5 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
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