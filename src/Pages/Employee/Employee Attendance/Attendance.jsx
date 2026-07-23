import { useEffect, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import EmployeePostModal from "./EmployeePostModal";
import EmployeeTable from "./EmployeeTable";
import EmployeeSort, { getMonthKey, getFilteredSortedLogs } from "./EmployeeSort";

export default function Attendance() {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date().toISOString()));
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");




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
    } catch (error) {
      console.error(error);
    }
  };

  const toggleExpanded = (rowDate) => {
    setExpanded((prev) => ({ ...prev, [rowDate]: !prev[rowDate] }));
  };

  const handleAddEntry = async () => {
    if (!date || !inTime) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const existing = logs.find((log) => log.date === date);

      if (existing) {
        await api.patch(`${ENDPOINTS.ATTENDANCE}/${existing.id}`, {
          inTime,
          outTime: outTime || null,
          note,
          status: outTime ? "Present" : "In Progress",
        });
      } else {
        await api.post(ENDPOINTS.ATTENDANCE, {
          employeeId: user.employeeId,
          userId: user.id,
          name: user.name,              // <-- Add this
          date,
          inTime,
          outTime: outTime || null,
          note,
          status: outTime ? "Present" : "In Progress",
        });
      }

      await fetchAttendance();

      setInTime("");
      setOutTime("");
      setNote("");
    } catch (error) {
      console.error(error);
    }
  };
  const startEditing = (log) => {
    setEditingDate(log.date);
    setEditText(log.note || "");
  };

  const cancelEditing = () => {
    setEditingDate(null);
    setEditText("");
  };

  const saveEditing = async (log) => {
    try {
      await api.patch(`${ENDPOINTS.ATTENDANCE}/${log.id}`, {
        note: editText,
      });

      await fetchAttendance();

      setEditingDate(null);
      setEditText("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkHoliday = async () => {
    if (!date) return;

    try {
      const user = getUser();
      const existing = logs.find((log) => log.date === date);

      if (existing) {
        await api.patch(`${ENDPOINTS.ATTENDANCE}/${existing.id}`, {
          status: "Holiday",
          inTime: null,
          outTime: null,
          note,
        });
      } else {
        await api.post(ENDPOINTS.ATTENDANCE, {
          employeeId: user.employeeId,
          userId: user.id,
          name: user.name,
          date,
          inTime: null,
          outTime: null,
          note,
          status: "Holiday",
        });
      }

      await fetchAttendance();
      setInTime("");
      setOutTime("");
      setNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAbsent = async () => {
    if (!date) return;

    try {
      const user = getUser();
      const existing = logs.find((log) => log.date === date);

      if (existing) {
        await api.patch(`${ENDPOINTS.ATTENDANCE}/${existing.id}`, {
          status: "Absent",
          inTime: null,
          outTime: null,
          note,
        });
      } else {
        await api.post(ENDPOINTS.ATTENDANCE, {
          employeeId: user.employeeId,
          userId: user.id,
          name: user.name,
          date,
          inTime: null,
          outTime: null,
          note,
          status: "Absent",
        });
      }

      await fetchAttendance();
      setInTime("");
      setOutTime("");
      setNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkLeave = async () => {
    if (!date) return;

    try {
      const user = getUser();

      const existingRequest = await api.get(
        `${ENDPOINTS.PERMISSIONS}?employeeId=${user.employeeId}&date=${date}`
      );

      if (existingRequest.data.length > 0) {
        alert("You have already requested leave for this date.");
        return;
      }

      await api.post(ENDPOINTS.PERMISSIONS, {
        employeeId: user.employeeId,
        userId: user.id,
        name: user.name,
        date,
        reason: note,
        status: "Pending",
      });

      setInTime("");
      setOutTime("");
      setNote("");

      alert("Leave request submitted successfully.");
    } catch (error) {
      console.error(error);
    }
  };

  const visibleLogs = getFilteredSortedLogs(logs, selectedMonth, sortOrder, statusFilter);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Attendance</h1>
      <p className="text-slate-500 text-sm mb-8">Add your attendance for any date</p>

      <EmployeePostModal
        date={date}
        setDate={setDate}
        inTime={inTime}
        setInTime={setInTime}
        outTime={outTime}
        setOutTime={setOutTime}
        note={note}
        setNote={setNote}
        handleAddEntry={handleAddEntry}
        handleMarkHoliday={handleMarkHoliday}
        handleMarkAbsent={handleMarkAbsent}
        handleMarkLeave={handleMarkLeave}
      />

      <EmployeeSort
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <EmployeeTable
        logs={visibleLogs}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        editingDate={editingDate}
        editText={editText}
        setEditText={setEditText}
        startEditing={startEditing}
        cancelEditing={cancelEditing}
        saveEditing={saveEditing}

      />
    </div>
  );
}