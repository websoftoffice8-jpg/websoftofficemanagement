import { useEffect, useState } from "react";
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

export default function PostEmployee({ isOpen, onClose }) {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    employeeId: "",
    name: "",
    password: "",
    department: "",
    position: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const loadNextEmployeeId = async () => {
      try {
        const res = await api.get(ENDPOINTS.EMPLOYEES);

        const ids = res.data
          .map((emp) => emp.employeeId)
          .filter((id) => /^EMP\d+$/.test(id))
          .map((id) => Number(id.replace("EMP", "")));

        const nextId = `EMP${String((ids.length ? Math.max(...ids) : 0) + 1).padStart(2, "0")}`;

        setForm({
          employeeId: nextId,
          name: "",
          password: "",
          department: "",
          position: "",
        });
      } catch (err) {
        console.error("Failed to generate employee ID", err);
      }
    };

    loadNextEmployeeId();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const existing = await api.get(
        `${ENDPOINTS.EMPLOYEES}?employeeId=${form.employeeId}`
      );

      if (existing.data.length > 0) {
        alert("Employee ID already exists.");
        return;
      }

      await api.post(ENDPOINTS.EMPLOYEES, {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onMouseDown={(e)=>{if(e.target===e.currentTarget)handleClose();}}>
      <div className="w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl shadow-slate-900/10">
        <div className="flex items-center justify-between px-6 py-5 bg-green-600">
          <div>
            <h2 className="text-lg font-semibold text-white">Add Employee</h2>
            <p className="text-sm text-green-100">Create a new employee account.</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-white/90 hover:bg-white/15"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium">Employee Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input required value={form.name} onChange={handleChange("name")} className="w-full py-2.5 pl-10 pr-4 bg-slate-50 border rounded-xl"/>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium">Employee ID</label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input value={form.employeeId} readOnly className="w-full py-2.5 pl-10 pr-4 bg-slate-100 border rounded-xl cursor-not-allowed"/>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input required type={showPassword?"text":"password"} value={form.password} onChange={handleChange("password")} className="w-full py-2.5 pl-10 pr-10 bg-slate-50 border rounded-xl"/>
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label>Department</label><div className="relative"><Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2"/><select required value={form.department} onChange={handleChange("department")} className="w-full py-2.5 pl-10 border rounded-xl"><option value="">Select</option>{DEPARTMENTS.map(d=><option key={d}>{d}</option>)}</select></div></div>
            <div><label>Position</label><div className="relative"><Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2"/><select required value={form.position} onChange={handleChange("position")} className="w-full py-2.5 pl-10 border rounded-xl"><option value="">Select</option>{POSITIONS.map(p=><option key={p}>{p}</option>)}</select></div></div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose}>Cancel</button>
            <button type="submit">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}
