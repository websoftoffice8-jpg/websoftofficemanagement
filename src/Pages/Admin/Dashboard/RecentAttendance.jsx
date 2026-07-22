import { getRecentAttendance } from "./utils";

export default function RecentAttendance({ attendance }) {
  const recentLogs = getRecentAttendance(attendance);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-5">
        Recent Attendance
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-3">Employee</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">In Time</th>
              <th className="pb-3">Out Time</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {recentLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="py-3">{log.name}</td>

                <td>{log.date}</td>

                <td>{log.inTime || "-"}</td>

                <td>{log.outTime || "-"}</td>

                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : log.status === "Absent"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}

            {recentLogs.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-slate-500"
                >
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}