import { getStatus } from "./EmployeeSort";

const WORD_LIMIT = 3;

export default function EmployeeTable({
  logs,
  expanded,
  toggleExpanded,
  editingDate,
  editText,
  setEditText,
  startEditing,
  cancelEditing,
  saveEditing,
}) {
  return (
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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatus(log) === "Present"
                        ? "bg-green-100 text-green-700"
                        : getStatus(log) === "Absent"
                          ? "bg-red-100 text-red-700"
                          : getStatus(log) === "Holiday"
                            ? "bg-blue-100 text-blue-700"
                            : getStatus(log) === "Leave"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-100 text-slate-700"
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
  );
}