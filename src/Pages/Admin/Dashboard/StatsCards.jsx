import { Users, UserCheck, UserX, CalendarDays } from "lucide-react";
import StatCard from "./StatCard";
import { getDashboardStats } from "./utils";

export default function StatsCards({ employees, attendance }) {
  const stats = getDashboardStats(employees, attendance);

  

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Present Today",
      value: stats.present,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Absent Today",
      value: stats.absent,
      icon: UserX,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Holiday Today",
      value: stats.holiday,
      icon: CalendarDays,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}