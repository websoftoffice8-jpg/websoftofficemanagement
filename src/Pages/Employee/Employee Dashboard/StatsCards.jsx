import { CalendarCheck, CalendarX, CalendarClock, Percent } from "lucide-react";
import { getEmployeeStats } from "./utils";

export default function StatsCards({ attendance, permissions, employeeId }) {
  const stats = getEmployeeStats(attendance, permissions, employeeId);

  const cards = [
    {
      title: "Present",
      value: stats.present,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
    },
    {
      title: "Absent",
      value: stats.absent,
      icon: CalendarX,
      color: "text-rose-600",
      bg: "bg-rose-50",
      ring: "ring-rose-100",
    },
    {
      title: "Leave",
      value: stats.leave,
      icon: CalendarClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-100",
    },
    {
      title: "Attendance %",
      value: `${stats.attendanceRate}%`,
      icon: Percent,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "ring-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="group bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between
                       transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 tracking-wide">
                {card.title}
              </p>
              <h2 className="text-3xl font-semibold mt-1.5 text-gray-900 tabular-nums">
                {card.value}
              </h2>
            </div>

            <div
              className={`${card.bg} ${card.ring} p-3.5 rounded-xl ring-1 transition-transform duration-200 group-hover:scale-105`}
            >
              <Icon className={`w-6 h-6 ${card.color}`} strokeWidth={2} />
            </div>
          </div>
        );
      })}
    </div>
  );
}