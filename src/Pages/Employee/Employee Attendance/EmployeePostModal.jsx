import { useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

export default function EmployeePostModal({ logs, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const handleAddEntry = async () => {
    if (!date || !inTime) return;

    const user = getUser();
    if (!user?.employeeId) {
      setError("No logged-in user found. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
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

      if (onSaved) await onSaved();

      setInTime("");
      setOutTime("");
      setNote("");
    } catch (err) {
      console.error(err);
      setError("Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}
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
            disabled={!date || !inTime || saving}
            className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700"
          >
            {saving ? "Saving..." : "Save Entry"}
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
  );
}