import { useMemo, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

const WORD_LIMIT = 3;

export default function EmployeeTable({ logs, onChanged }) {
  const [expanded, setExpanded] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [editText, setEditText] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("All");

  const toggleExpanded = (rowDate) => {
    setExpanded((prev) => ({ ...prev, [rowDate]: !prev[rowDate] }));
  };

  const getStatus = (log) => {
    if (!log.outTime) return "Absent";
    return "Present";
  };

  const getWorkingHours = (log) => {
    if (!log.inTime || !log.outTime) return "—";
    const [inH, inM] = log.inTime.split(":").map(Number);
    const [outH, outM] = log.outTime.split(":").map(Number);
    let minutes = outH * 60 + outM - (inH * 60 + inM);
    if (minutes < 0) minutes += 24 * 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      await api.patch(`${ENDPOINTS.ATTENDANCE}/${log.id}`, { note: editText });
      if (onChanged) await onChanged();
      setEditingDate(null);
      setEditText("");
    } catch (error) {
      console.error(error);
    }
  };

  const visibleLogs = useMemo(() => {
    let result = [...logs];
    if (statusFilter !== "All") {
      result = result.filter((log) => getStatus(log) === statusFilter);
    }
    result.sort((a, b) =>
      sortOrder === "desc" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
    );
    return result;
  }, [logs, statusFilter, sortOrder]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="All">All</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
          className="text-xs font-medium text-slate-600 hover:text-green-600 flex items-center gap-1"
        >
          Sort by Date: {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Date</th>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium">In Time</th>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Out Time</th>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Working Hours</th>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Log</th>
          </tr>
        </thead>
        <tbody>
          {visibleLogs.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-slate-400 py-10">
                No attendance logged yet
              </td>
            </tr>
          )}
          {visibleLogs.map((log) => {
            const words = (log.note || "").trim().split(/\s+/).filter(Boolean);
            const isLong = words.length > WORD_LIMIT;
            const preview = words.slice(0, WORD_LIMIT).join(" ");
            const isEditing = editingDate === log.date;

            return (
              <tr key={log.id} className="border-b border-slate-100 last:border-0 align-top">
                <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.date}</td>
                <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.inTime}</td>
                <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.outTime || "—"}</td>
                <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{getWorkingHours(log)}</td>
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
                        <button onClick={() => saveEditing(log)} className="text-green-600 text-xs font-medium hover:underline">
                          Save
                        </button>
                        <button onClick={cancelEditing} className="text-slate-400 text-xs font-medium hover:underline">
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
  );
}