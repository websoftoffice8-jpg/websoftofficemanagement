export default function EmployeePostModal({
  date, setDate, inTime, setInTime, outTime, setOutTime,
  note, setNote, handleAddEntry, handleMarkHoliday, handleMarkAbsent,
}) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
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
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 invisible">Save</label>
          <button
            onClick={handleAddEntry}
            disabled={!date || !inTime}
            className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700"
          >
            Save Entry
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleMarkAbsent}
          disabled={!date}
          className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-700"
        >
          Mark Absent
        </button>
        <button
          onClick={handleMarkHoliday}
          disabled={!date}
          className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          Mark Holiday
        </button>
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