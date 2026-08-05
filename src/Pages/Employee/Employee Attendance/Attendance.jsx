import { useEffect, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import EmployeePostModal from "./EmployeePostModal";
import EmployeeTable from "./EmployeeTable";
import EmployeeSort, { getMonthKey, getFilteredSortedLogs, toLocalDateString } from "./EmployeeSort";

export default function Attendance() {
  const [holidays, setHolidays] = useState([]);
  const [leaveFrom, setLeaveFrom] = useState(toLocalDateString(new Date()));
  const [leaveTo, setLeaveTo] = useState(toLocalDateString(new Date()));
  const [permissions, setPermissions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(toLocalDateString(new Date()));
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(toLocalDateString(new Date())));
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleMarkLeave = async () => {
    if (!leaveFrom || !leaveTo) return;

    if (leaveTo < leaveFrom) {
      alert("End date cannot be before the start date.");
      return;
    }

    try {
      const user = getUser();

      const existing = await api.get(
        `${ENDPOINTS.PERMISSIONS}?employeeId=${user.employeeId}`
      );

      // Range overlap check (fallback to legacy `date` field for old records)
      const overlapping = existing.data.some((p) => {
        if (p.status === "Rejected") return false;
        const pFrom = p.fromDate || p.date;
        const pTo = p.toDate || p.date;
        return leaveFrom <= pTo && leaveTo >= pFrom;
      });

      if (overlapping) {
        alert("You already have a leave request overlapping this date range.");
        return;
      }

      await api.post(ENDPOINTS.PERMISSIONS, {
        employeeId: user.employeeId,
        userId: user.id,
        name: user.name,
        fromDate: leaveFrom,
        toDate: leaveTo,
        reason: note,
        status: "Pending",
        requestedAt: new Date().toISOString(),
      });

      setNote("");
      setLeaveFrom(toLocalDateString(new Date()));
      setLeaveTo(toLocalDateString(new Date()));

      alert("Leave request submitted successfully.");
    } catch (error) {
      console.error(error);
    }
  };

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

    try {
      const [attendanceRes, permissionRes, holidayRes] = await Promise.all([
        api.get(`${ENDPOINTS.ATTENDANCE}?employeeId=${user.employeeId}`),
        api.get(`${ENDPOINTS.PERMISSIONS}?employeeId=${user.employeeId}`),
        api.get(ENDPOINTS.HOLIDAYS),
      ]);
      setHolidays(holidayRes.data);

      setLogs(attendanceRes.data.sort((a, b) => b.date.localeCompare(a.date)));
      setPermissions(permissionRes.data);
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
      const user = getUser();
      const existing = logs.find((log) => log.date === date);

      const attendance = {
        employeeId: user.employeeId,
        userId: user.id,
        name: user.name,
        date,
        inTime,
        outTime: outTime || null,
        note,
      };

      if (existing) {
        await api.patch(
          `${ENDPOINTS.ATTENDANCE}/${existing.id}`,
          attendance
        );
      } else {
        await api.post(
          ENDPOINTS.ATTENDANCE,
          attendance
        );
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

  const visibleLogs = getFilteredSortedLogs(
    logs,
    permissions,
    holidays,
    selectedMonth,
    sortOrder,
    statusFilter
  );

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
        leaveFrom={leaveFrom}
        setLeaveFrom={setLeaveFrom}
        leaveTo={leaveTo}
        setLeaveTo={setLeaveTo}
        handleAddEntry={handleAddEntry}
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