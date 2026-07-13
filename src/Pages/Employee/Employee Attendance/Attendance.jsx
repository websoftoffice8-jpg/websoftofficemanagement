import { useEffect, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import EmployeePostModal from "./EmployeePostModal";
import EmployeeTable from "./EmployeeTable";

export default function Attendance() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const fetchAttendance = async () => {
    const user = getUser();
    if (!user?.employeeId) {
      setError("No logged-in user found. Please log in again.");
      return;
    }

    try {
      const res = await api.get(`${ENDPOINTS.ATTENDANCE}?employeeId=${user.employeeId}`);
      setLogs(res.data.sort((a, b) => b.date.localeCompare(a.date)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance data.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Attendance</h1>
      <p className="text-slate-500 text-sm mb-8">Add your attendance for any date</p>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      <EmployeePostModal logs={logs} onSaved={fetchAttendance} />
      <EmployeeTable logs={logs} onChanged={fetchAttendance} />
    </div>
  );
}