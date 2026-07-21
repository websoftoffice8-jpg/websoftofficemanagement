// src/components/dashboard/sections/StatCards.jsx
// The 5-card summary strip. Pure presentational — all numbers are
// computed upstream in Dashboard.jsx and passed in via `stats`.
import { Users, CalendarCheck2, CalendarX2, CalendarClock } from "lucide-react";


const StatCards = ({ stats, departmentCount }) => {
  const statCards = [
    {
      label: "Total Staff",
      value: stats.totalStaff,
      icon: Users,
      gradient: "from-slate-700 to-slate-900",
      sub: `${departmentCount} department${departmentCount === 1 ? "" : "s"}`,
    },
    {
      label: "Present",
      value: stats.present,
      icon: CalendarCheck2,
      gradient: "from-green-500 to-green-700",
      sub: stats.marked ? `${Math.round((stats.present / stats.marked) * 100)}% of marked` : "No records yet",
    },
    {
      label: "Absent",
      value: stats.absent,
      icon: CalendarX2,
      gradient: "from-red-400 to-red-600",
      sub: stats.marked ? `${Math.round((stats.absent / stats.marked) * 100)}% of marked` : "No records yet",
    },
    {
      label: "Holiday",
      value: stats.holiday,
      icon: CalendarX2,
      gradient: "from-red-400 to-red-600",
      sub: stats.marked ? `${Math.round((stats.holiday / stats.marked) * 100)}% of marked` : "No records yet",
    },
 
    
  ];

  return (
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map(({ label, value, icon: Icon, gradient, sub }, i) => (
        <div
          key={label}
          style={{ animationDelay: `${i * 60}ms` }}
          className="dash-animate group relative overflow-hidden bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-5 hover:shadow-[0_4px_20px_-4px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <div
            className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-[0.06] group-hover:opacity-[0.1] transition-opacity`}
          />
          <div className={`bg-gradient-to-br ${gradient} rounded-xl p-2.5 w-fit shadow-sm`}>
            <Icon size={20} className="text-white" />
          </div>
          <p className="text-[28px] leading-none font-bold text-slate-800 mt-4 tabular-nums">
            {value}
          </p>
          <p className="text-slate-500 text-sm font-medium mt-2">{label}</p>
          <p className="text-slate-400 text-xs mt-1">{sub}</p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;