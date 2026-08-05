import { FileText } from "lucide-react";
import { getLatestLeave, formatLeaveRange } from "./utils";

export default function LeaveStatus({ permissions, employeeId }) {
  const leave = getLatestLeave(permissions, employeeId);

  const statusStyle = {
    Approved: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Leave Request Status
        </h2>
      </div>

      {!leave ? (
        <div className="flex-1 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-8 px-4">
          <p className="text-sm text-slate-400">
            You haven't submitted any leave requests.
          </p>
        </div>
      ) : (
        <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Leave Date
              </p>
              <p className="text-slate-800 font-semibold mt-0.5 truncate">
                {formatLeaveRange(leave.fromDate || leave.date, leave.toDate)}
              </p>
            </div>

            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                statusStyle[leave.status] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {leave.status}
            </span>
          </div>

          {leave.reason && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Reason
              </p>
              <p className="text-slate-600 mt-1 text-sm leading-relaxed">
                {leave.reason}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}