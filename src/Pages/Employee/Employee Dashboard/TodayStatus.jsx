import { CheckCircle2, XCircle, CalendarClock, PartyPopper, Clock } from "lucide-react";
import { getTodayStatus } from "./utils";

const STATUS_CONFIG = {
  Present: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Absent: {
    color: "text-rose-700",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  Leave: {
    color: "text-violet-700",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    dot: "bg-violet-500",
    icon: CalendarClock,
  },
  Holiday: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    dot: "bg-blue-500",
    icon: PartyPopper,
  },
  "Not Marked": {
    color: "text-slate-500",
    bg: "bg-slate-50",
    ring: "ring-slate-200",
    dot: "bg-slate-400",
    icon: Clock,
  },
};

export default function TodayStatus({ attendance, permissions, holidays, employeeId }) {
  const { status } = getTodayStatus(attendance, permissions, holidays, employeeId);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Not Marked"];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.bg}`}>
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Today's Status
          </p>
          <p className={`text-lg font-bold mt-0.5 ${config.color}`}>{status}</p>
        </div>
      </div>

      <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
    </div>
  );
}