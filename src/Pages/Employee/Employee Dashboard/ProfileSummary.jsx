import { CheckCircle2, XCircle, CalendarClock, PartyPopper, Clock } from "lucide-react";
import { getGreeting, formatToday, getInitials, getTodayStatus } from "./utils";

const STATUS_CONFIG = {
  Present: { color: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200", icon: CheckCircle2 },
  Absent: { color: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200", icon: XCircle },
  Leave: { color: "text-violet-700", bg: "bg-violet-50", ring: "ring-violet-200", icon: CalendarClock },
  Holiday: { color: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-200", icon: PartyPopper },
  "Not Marked": { color: "text-slate-500", bg: "bg-slate-50", ring: "ring-slate-200", icon: Clock },
};

export default function ProfileSummary({ user, attendance, permissions, holidays }) {
  const { status } = getTodayStatus(attendance, permissions, holidays, user?.employeeId);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Not Marked"];
  const StatusIcon = config.icon;

  const fields = [
    { label: "Employee ID", value: user?.employeeId },
    { label: "Position", value: user?.position },
    { label: "Department", value: user?.department },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-semibold text-sm tracking-wide">
            {getInitials(user?.name)}
          </div>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate">
              {getGreeting()}, {user?.name || "there"} 👋
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              {formatToday()}
            </div>
          </div>
        </div>

        <div
          className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full ring-1 ${config.bg} ${config.ring}`}
        >
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{status}</span>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {f.label}
            </p>
            <p className="text-slate-700 font-medium mt-0.5 truncate">
              {f.value || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}