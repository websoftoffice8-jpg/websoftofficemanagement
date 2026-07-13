import { useState, useEffect } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import EmployeePostModal from "./EmployeePostModal";
import EmployeeTable from "./EmployeeTable";
import EmployeeSort, { getMonthKey, getFilteredSortedLogs } from "./EmployeeSort";

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date().toISOString()));
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  // fetch data from attendance table, filtered by employeeId
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await api.get(
        `${ENDPOINTS.ATTENDANCE}?employeeId=${user.employeeId}`
      );

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
          status: outTime ? "Completed" : "In Progress",
        });
      } else {
        await api.post(ENDPOINTS.ATTENDANCE, {
          employeeId: user.employeeId,
          userId: user.id,
          date,
          inTime,
          outTime: outTime || null,
          note,
          status: outTime ? "Completed" : "In Progress",
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