import { getGreeting, formatToday, getInitials } from "./utils";

export default function DashboardHeader({ user }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 flex items-center gap-4">
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
  );
}