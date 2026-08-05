import { CalendarCheck, CalendarX, CalendarClock, Percent } from "lucide-react";
import { getEmployeeStats } from "./utils";

export default function StatsCards({ attendance, permissions, employeeId }) {
  const stats = getEmployeeStats(attendance, permissions, employeeId);

  const cards = [
    {
      title: "Present",
      value: stats.present,
      icon: CalendarCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Absent",
      value: stats.absent,
      icon: CalendarX,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Leave",
      value: stats.leave,
      icon: CalendarClock,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Attendance %",
      value: `${stats.attendanceRate}%`,
      icon: Percent,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border shadow-sm p-5 flex items-center justify-between transition-shadow hover:shadow-md"
          >
            <div>
              <p className="text-sm text-gray-500">{card.title}</p>
              <h2 className="text-3xl font-bold mt-1 text-gray-800">
                {card.value}
              </h2>
            </div>

            <div className={`${card.bg} p-3 rounded-lg`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}