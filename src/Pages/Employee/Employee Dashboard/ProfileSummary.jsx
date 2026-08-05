import { getGreeting, formatToday, getInitials } from "./utils";

export default function ProfileSummary({ user }) {
  const fields = [
    { label: "Employee ID", value: user?.employeeId },
    { label: "Position", value: user?.position },
    { label: "Department", value: user?.department },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 h-full">
      <div className="flex items-center gap-4">
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