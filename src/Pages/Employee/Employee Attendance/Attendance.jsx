import { useState, useEffect } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState("");

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

  const WORD_LIMIT = 3;

  const toggleExpanded = (rowDate) => {
    setExpanded((prev) => ({ ...prev, [rowDate]: !prev[rowDate] }));
  };

  const getStatus = (log) => {
    if (!log.outTime) return "Absent";
    return "Present";
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

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Attendance</h1>
      <p className="text-slate-500 text-sm mb-8">Add your attendance for any date</p>

      {/* Add Entry Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">In Time</label>
            <input
              type="time"
              value={inTime}
              onChange={(e) => setInTime(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Out Time</label>
            <input
              type="time"
              value={outTime}
              onChange={(e) => setOutTime(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddEntry}
              disabled={!date || !inTime}
              className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700"
            >
              Save Entry
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            What did you work on today?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. Finished the landing page redesign, fixed login bug"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Date</th>
              <th className="text-left px-5 py-3.5 text-slate-500 font-medium">In Time</th>
              <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Out Time</th>
              <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
              <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Log</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-400 py-10">
                  No attendance logged yet
                </td>
              </tr>
            )}
            {logs.map((log) => {
              const words = (log.note || "").trim().split(/\s+/).filter(Boolean);
              const isLong = words.length > WORD_LIMIT;
              const preview = words.slice(0, WORD_LIMIT).join(" ");
              const isEditing = editingDate === log.date;

              return (
                <tr key={log.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.date}</td>
                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.inTime}</td>
                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.outTime || "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatus(log) === "Present"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {getStatus(log)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 max-w-sm">
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                        />
                        <div className="flex gap-3 mt-1.5">
                          <button
                            onClick={() => saveEditing(log)}
                            className="text-green-600 text-xs font-medium hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-slate-400 text-xs font-medium hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : log.note ? (
                      <span>
                        {expanded[log.date] ? log.note : preview}
                        {isLong && !expanded[log.date] && "..."}
                        {isLong && (
                          <button
                            onClick={() => toggleExpanded(log.date)}
                            className="text-green-600 text-xs font-medium ml-1.5 hover:underline"
                          >
                            {expanded[log.date] ? "See less" : "See more"}
                          </button>
                        )}
                        <button
                          onClick={() => startEditing(log)}
                          className="text-slate-400 text-xs font-medium ml-1.5 hover:text-green-600 hover:underline"
                        >
                          Edit
                        </button>
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        —
                        <button
                          onClick={() => startEditing(log)}
                          className="text-slate-400 text-xs font-medium ml-1.5 hover:text-green-600 hover:underline"
                        >
                          Edit
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}