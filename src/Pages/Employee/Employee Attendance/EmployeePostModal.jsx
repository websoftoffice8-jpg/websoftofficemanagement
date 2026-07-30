import { toLocalDateString } from "./EmployeeSort";

export default function EmployeePostModal({
  date,
  setDate,
  inTime,
  setInTime,
  outTime,
  setOutTime,
  note,
  setNote,
  leaveFrom,
  setLeaveFrom,
  leaveTo,
  setLeaveTo,
  handleAddEntry,
  handleMarkLeave,
}) {
  const today = toLocalDateString(new Date());

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            min={today}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            In Time
          </label>
          <input
            type="time"
            value={inTime}
            onChange={(e) => setInTime(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Out Time
          </label>
          <input
            type="time"
            value={outTime}
            onChange={(e) => setOutTime(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 invisible">
            Save
          </label>
          <button
            onClick={handleAddEntry}
            disabled={!date || !inTime}
            className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700"
          >
            Save Entry
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-3">Request Leave</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={leaveFrom}
              min={today}
              onChange={(e) => {
                setLeaveFrom(e.target.value);
                if (leaveTo < e.target.value) setLeaveTo(e.target.value);
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={leaveTo}
              min={leaveFrom || today}
              onChange={(e) => setLeaveTo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleMarkLeave}
              disabled={!leaveFrom || !leaveTo}
              className="w-full px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700"
            >
              Request Leave
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Describe your work or reason for leave...
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Finished the landing page redesign, fixed login bug, or reason for leave"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
        />
      </div>
    </div>
  );
}