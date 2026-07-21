// src/components/dashboard/Dashboard.jsx
import ENDPOINTS from "../../../API/endpoints";
import api from "../../../API/Axios";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  CalendarCheck2,
  CalendarX2,
  CalendarClock,
  Building2,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  LayoutGrid,
  RefreshCw,
  Clock,
  Search,
  Download,
  UserCheck,
  CalendarDays,
  X,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Status → colors, kept in one place so the pie chart, stacked bars,
// legend, and table badges all stay in sync.
const STATUS_STYLES = {
  Present: { hex: "#16a34a", dot: "bg-green-600", badge: "bg-green-50 text-green-700 border-green-200" },
  Absent: { hex: "#ef4444", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  Holiday: { hex: "#3b82f6", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  Leave: { hex: "#f59e0b", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200" },
};
const statusStyle = (status) =>
  STATUS_STYLES[status] || { hex: "#94a3b8", dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200" };

// A staff member arriving after this time (24h minutes) counts as "late".
// Tweak to match your organization's grace period.
const LATE_THRESHOLD_MIN = 9 * 60 + 30; // 09:30

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatDateLabel = (isoDate) =>
  new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

const formatDayShort = (isoDate) =>
  new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// Parses "09:15", "9:15 AM", "09:15 PM" etc. into minutes-since-midnight.
// Returns null if the string can't be read, so callers can skip it safely.
const parseTimeToMinutes = (t) => {
  if (!t || typeof t !== "string") return null;
  const match = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let [, hh, mm, ap] = match;
  hh = parseInt(hh, 10);
  mm = parseInt(mm, 10);
  if (ap) {
    ap = ap.toUpperCase();
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
  }
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
};

const formatMinutes = (mins) => {
  if (mins === null || mins === undefined || Number.isNaN(mins)) return "—";
  const hh24 = Math.floor(mins / 60);
  const mm = String(mins % 60).padStart(2, "0");
  const ap = hh24 >= 12 ? "PM" : "AM";
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
  return `${hh12}:${mm} ${ap}`;
};

// Green-tinted heat scale for the monthly overview — darker means a
// higher share of staff were present that day.
const heatColor = (rate) => {
  if (rate === null || rate === undefined) return "#f1f5f9";
  const opacity = Math.max(0.14, Math.min(1, rate / 100));
  return `rgba(22, 163, 74, ${opacity})`;
};

// Shared tooltip styling so both charts match the rest of the UI
// instead of Recharts' default look.
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1.5">{label}</p>}
      <div className="space-y-1">
        {payload
          .filter((p) => p.value > 0)
          .map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: p.color || p.payload?.color }}
              />
              <span className="text-slate-500">{p.name}</span>
              <span className="font-semibold text-slate-800 ml-auto tabular-nums">
                {p.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

// Custom active shape for the donut: lifts the hovered slice, adds a
// soft inner ring, and prints its own value/label in the exact center
// so the number is never off-register with the arc.
const renderActiveDonutShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 9}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Math.max(0, innerRadius - 6)}
        outerRadius={innerRadius - 1}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.25}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 24, fontWeight: 700, fill: "#1e293b" }}>
        {value}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" style={{ fontSize: 11, fill: "#94a3b8" }}>
        {payload.name} · {Math.round(percent * 100)}%
      </text>
    </g>
  );
};

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSlice, setActiveSlice] = useState(null);

  // Filters for the "Recent Attendance" table
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [usersRes, attendanceRes] = await Promise.all([
        api.get(`${ENDPOINTS.EMPLOYEES}`),
        api.get(`${ENDPOINTS.ATTENDANCE}`),
      ]);
      setEmployees(usersRes.data || []);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Couldn't load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Staff only — admins aren't tracked for attendance.
  const staff = useMemo(
    () => employees.filter((e) => e.role !== "admin"),
    [employees]
  );

  const departments = useMemo(
    () => Array.from(new Set(staff.map((e) => e.department).filter(Boolean))).sort(),
    [staff]
  );

  // Maps an attendance record's employeeId back to a department, so the
  // table filter can work even though attendance rows don't carry it.
  const departmentByEmployeeId = useMemo(() => {
    const map = {};
    employees.forEach((e) => {
      if (e.employeeId) map[e.employeeId] = e.department;
    });
    return map;
  }, [employees]);

  // Prefer real "today" records; if the dataset has none for the actual
  // calendar date (e.g. seed/demo data), fall back to the most recent
  // date present so the dashboard never renders empty for no reason.
  const activeDate = useMemo(() => {
    const real = todayISO();
    const hasToday = attendance.some((a) => a.date === real);
    if (hasToday) return real;

    const dates = attendance.map((a) => a.date).filter(Boolean).sort();
    return dates[dates.length - 1] || real;
  }, [attendance]);

  const todaysRecords = useMemo(
    () => attendance.filter((a) => a.date === activeDate),
    [attendance, activeDate]
  );

  const stats = useMemo(() => {
    const present = todaysRecords.filter((a) => a.status === "Present").length;
    const absent = todaysRecords.filter((a) => a.status === "Absent").length;
    const holiday = todaysRecords.filter((a) => a.status === "Holiday").length;
    const leave = todaysRecords.filter((a) => a.status === "Leave").length;
    const late = todaysRecords.filter(
      (a) => a.status === "Present" && (parseTimeToMinutes(a.inTime) ?? -1) > LATE_THRESHOLD_MIN
    ).length;
    const marked = todaysRecords.length;
    const rate = marked > 0 ? Math.round((present / marked) * 100) : 0;

    return {
      totalStaff: staff.length,
      present,
      absent,
      onLeave: leave + holiday,
      holiday,
      leave,
      late,
      marked,
      rate,
    };
  }, [todaysRecords, staff]);

  // Average check-in time across everyone marked Present today, used in
  // the "Currently In" panel and as a quick operational signal.
  const avgCheckInMinutes = useMemo(() => {
    const minutes = todaysRecords
      .filter((a) => a.status === "Present")
      .map((a) => parseTimeToMinutes(a.inTime))
      .filter((m) => m !== null);
    if (minutes.length === 0) return null;
    return Math.round(minutes.reduce((sum, m) => sum + m, 0) / minutes.length);
  }, [todaysRecords]);

  // Staff who checked in today but haven't checked out yet — a live
  // "who's in the building" view.
  const whosInNow = useMemo(() => {
    return todaysRecords
      .filter((a) => a.status === "Present" && a.inTime && !a.outTime)
      .sort((a, b) => (parseTimeToMinutes(a.inTime) ?? 0) - (parseTimeToMinutes(b.inTime) ?? 0));
  }, [todaysRecords]);

  // Data for the donut chart — filtered to non-zero slices so the
  // legend doesn't show empty statuses.
  const pieData = useMemo(
    () =>
      [
        { name: "Present", value: stats.present, color: STATUS_STYLES.Present.hex },
        { name: "Absent", value: stats.absent, color: STATUS_STYLES.Absent.hex },
        { name: "Leave", value: stats.leave, color: STATUS_STYLES.Leave.hex },
        { name: "Holiday", value: stats.holiday, color: STATUS_STYLES.Holiday.hex },
      ].filter((d) => d.value > 0),
    [stats]
  );

  const departmentBreakdown = useMemo(() => {
    const counts = staff.reduce((acc, emp) => {
      if (!emp.department) return acc;
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});
    const max = Math.max(1, ...Object.values(counts));
    const palette = ["#16a34a", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([department, count], i) => ({
        department,
        count,
        percent: Math.round((count / max) * 100),
        color: palette[i % palette.length],
      }));
  }, [staff]);

  // Every distinct date recorded, oldest → newest, broken down by status,
  // reused for both the 7-day bar chart and the monthly heatmap.
  const attendanceByDate = useMemo(() => {
    const byDate = attendance.reduce((acc, a) => {
      if (!a.date) return acc;
      acc[a.date] = acc[a.date] || { Present: 0, Absent: 0, Leave: 0, Holiday: 0, total: 0 };
      if (acc[a.date][a.status] !== undefined) acc[a.date][a.status] += 1;
      acc[a.date].total += 1;
      return acc;
    }, {});
    return byDate;
  }, [attendance]);

  const weeklyTrend = useMemo(() => {
    return Object.keys(attendanceByDate)
      .sort()
      .slice(-7)
      .map((date) => ({
        day: formatDayShort(date),
        fullDate: formatDateLabel(date),
        ...attendanceByDate[date],
      }));
  }, [attendanceByDate]);

  const weeklyAverageRate = useMemo(() => {
    if (weeklyTrend.length === 0) return null;
    const totals = weeklyTrend.reduce(
      (acc, d) => ({ present: acc.present + d.Present, total: acc.total + d.total }),
      { present: 0, total: 0 }
    );
    return totals.total > 0 ? Math.round((totals.present / totals.total) * 100) : 0;
  }, [weeklyTrend]);

  // Last 28 recorded dates as a compact attendance-rate heatmap.
  const monthlyHeatmap = useMemo(() => {
    return Object.keys(attendanceByDate)
      .sort()
      .slice(-28)
      .map((date) => {
        const d = attendanceByDate[date];
        const rate = d.total ? Math.round((d.Present / d.total) * 100) : null;
        return { date, rate };
      });
  }, [attendanceByDate]);

  const rateVsWeeklyAvg =
    weeklyAverageRate === null ? null : stats.rate - weeklyAverageRate;

  // Full, filterable attendance log behind the "Recent Attendance" table.
  const filteredActivity = useMemo(() => {
    let list = [...attendance].filter((a) => a.date);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.employeeId || "").toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "all") {
      list = list.filter((a) => departmentByEmployeeId[a.employeeId] === deptFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }

    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [attendance, search, deptFilter, statusFilter, departmentByEmployeeId]);

  const hasActiveFilters = search.trim() !== "" || deptFilter !== "all" || statusFilter !== "all";
  const visibleActivity = filteredActivity.slice(0, 8);

  const clearFilters = () => {
    setSearch("");
    setDeptFilter("all");
    setStatusFilter("all");
  };

  const exportCSV = () => {
    const rows = hasActiveFilters ? filteredActivity : todaysRecords;
    if (rows.length === 0) return;
    const headers = ["Employee", "Employee ID", "Date", "In", "Out", "Status"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [r.name, r.employeeId, r.date, r.inTime || "", r.outTime || "", r.status].map(escape).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_${hasActiveFilters ? "filtered" : activeDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      label: "Total Staff",
      value: stats.totalStaff,
      icon: Users,
      gradient: "from-slate-700 to-slate-900",
      sub: `${departmentBreakdown.length} department${departmentBreakdown.length === 1 ? "" : "s"}`,
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
      label: "Late Arrivals",
      value: stats.late,
      icon: Clock,
      gradient: "from-orange-400 to-orange-600",
      sub: `After ${formatMinutes(LATE_THRESHOLD_MIN)}`,
    },
    {
      label: "On Leave / Holiday",
      value: stats.onLeave,
      icon: CalendarClock,
      gradient: "from-amber-400 to-amber-600",
      sub: `${stats.leave} leave · ${stats.holiday} holiday`,
    },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes dashFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dash-animate {
          animation: dashFadeUp 0.5s ease-out both;
        }
      `}</style>

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-600 to-emerald-800 px-6 py-7 sm:px-8 sm:py-8 shadow-lg shadow-green-900/10 dash-animate">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center shrink-0">
              <LayoutGrid size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {greeting()}, Admin
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-medium text-white/90 bg-white/15 rounded-full px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-green-100/90 text-sm mt-1">
                Attendance overview for {formatDateLabel(activeDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {rateVsWeeklyAvg !== null && (
              <div
                className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg backdrop-blur-sm ${
                  rateVsWeeklyAvg >= 0 ? "bg-white/15 text-white" : "bg-red-500/20 text-red-50"
                }`}
              >
                {rateVsWeeklyAvg >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {Math.abs(rateVsWeeklyAvg)}pt vs weekly avg
              </div>
            )}
            <div className="flex items-center gap-2 bg-white text-green-700 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm">
              <TrendingUp size={16} />
              {stats.rate}% attendance
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white transition-colors"
              aria-label="Export attendance as CSV"
              title="Export CSV"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => fetchData({ silent: true })}
              disabled={isRefreshing}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white transition-colors disabled:opacity-60"
              aria-label="Refresh dashboard"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* Absentee alert banner — surfaces automatically when absences run high */}
      {!isLoading && stats.marked > 0 && stats.absent / stats.marked >= 0.2 && (
        <div className="flex items-center gap-2.5 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 dash-animate">
          <AlertTriangle size={17} className="shrink-0" />
          <span>
            <span className="font-semibold">{stats.absent}</span> of {stats.marked} staff are absent today
            ({Math.round((stats.absent / stats.marked) * 100)}%) — above the usual range.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-24">
          <Loader2 size={18} className="animate-spin" />
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Today's distribution — interactive donut */}
            <div className="dash-animate lg:col-span-4 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">
                Today's Distribution
              </h2>

              {stats.marked === 0 ? (
                <p className="text-sm text-slate-400 py-16 text-center">
                  No attendance marked for this day.
                </p>
              ) : (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <defs>
                        <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.12" />
                        </filter>
                      </defs>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={pieData.length > 1 ? 3 : 0}
                        cornerRadius={4}
                        startAngle={90}
                        endAngle={-270}
                        animationDuration={700}
                        filter="url(#donutShadow)"
                        activeIndex={activeSlice}
                        activeShape={renderActiveDonutShape}
                        onMouseEnter={(_, index) => setActiveSlice(index)}
                        onMouseLeave={() => setActiveSlice(null)}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value, entry) => (
                          <span className="text-xs text-slate-500">
                            {value}
                            <span className="text-slate-400"> · {entry.payload.value}</span>
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Default center label — hidden while a slice is hovered,
                      since the active shape draws its own centered label. */}
                  {activeSlice === null && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ paddingBottom: 44 }}
                    >
                      <span className="text-[26px] font-bold text-slate-800 tabular-nums leading-none">
                        {stats.rate}%
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide mt-1.5">
                        Present
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weekly attendance trend — Recharts stacked bar chart */}
            <div className="dash-animate lg:col-span-8 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">
                Attendance This Week
              </h2>

              {weeklyTrend.length === 0 ? (
                <p className="text-sm text-slate-400 py-16 text-center">
                  No attendance records yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyTrend} barCategoryGap="28%">
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      width={24}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "#f8fafc" }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-slate-500">{value}</span>
                      )}
                    />
                    <Bar dataKey="Present" stackId="a" fill={STATUS_STYLES.Present.hex} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Absent" stackId="a" fill={STATUS_STYLES.Absent.hex} />
                    <Bar dataKey="Leave" stackId="a" fill={STATUS_STYLES.Leave.hex} />
                    <Bar
                      dataKey="Holiday"
                      stackId="a"
                      fill={STATUS_STYLES.Holiday.hex}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Who's currently in — live check-in view */}
            <div className="dash-animate lg:col-span-5 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <UserCheck size={16} className="text-green-600" />
                  Currently In
                </h2>
                <span className="text-xs font-medium text-slate-400 tabular-nums">
                  {whosInNow.length} on-site
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Avg check-in today: <span className="font-medium text-slate-500">{formatMinutes(avgCheckInMinutes)}</span>
              </p>

              {whosInNow.length === 0 ? (
                <p className="text-sm text-slate-400 py-10 text-center">
                  No one has checked in yet.
                </p>
              ) : (
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {whosInNow.map((entry) => {
                    const late = (parseTimeToMinutes(entry.inTime) ?? -1) > LATE_THRESHOLD_MIN;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm">
                          {entry.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{entry.name}</p>
                          <p className="text-xs text-slate-400 truncate">{entry.employeeId}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-slate-600 tabular-nums">{entry.inTime}</p>
                          {late && (
                            <span className="text-[10px] font-medium text-orange-600">Late</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly overview — compact attendance heatmap */}
            <div className="dash-animate lg:col-span-7 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-400" />
                  Attendance Rate — Last 4 Weeks
                </h2>
              </div>

              {monthlyHeatmap.length === 0 ? (
                <p className="text-sm text-slate-400 py-16 text-center">
                  No attendance records yet.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-1.5">
                    {monthlyHeatmap.map(({ date, rate }) => (
                      <div
                        key={date}
                        title={`${formatDateLabel(date)}: ${rate === null ? "no data" : `${rate}% present`}`}
                        className="aspect-square rounded-md border border-slate-100"
                        style={{ backgroundColor: heatColor(rate) }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[11px] text-slate-400">Lower</span>
                    <div className="flex items-center gap-1">
                      {[15, 35, 55, 75, 100].map((r) => (
                        <span
                          key={r}
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: heatColor(r) }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">Higher</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Department breakdown */}
            <div className="dash-animate lg:col-span-5 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-slate-800">
                  Staff by Department
                </h2>
                <Building2 size={17} className="text-slate-300" />
              </div>

              {departmentBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">
                  No department data yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {departmentBreakdown.map(({ department, count, percent, color }, i) => (
                    <div key={department}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-sm text-slate-600 flex-1">{department}</span>
                        <span className="text-sm font-semibold text-slate-800 tabular-nums">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percent}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent attendance activity — searchable & filterable */}
            <div className="dash-animate lg:col-span-7 bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="flex flex-col gap-3 px-6 py-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Recent Attendance
                  </h2>
                  <a
                    href="/admin/attendance"
                    className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                  >
                    View all
                    <ArrowUpRight size={15} />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[160px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search employee..."
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400"
                    />
                  </div>
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="all">All departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="all">All statuses</option>
                    {Object.keys(STATUS_STYLES).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5"
                    >
                      <X size={13} />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {visibleActivity.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">
                  {hasActiveFilters ? "No records match your filters." : "No attendance activity recorded yet."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">In</th>
                        <th className="px-6 py-3">Out</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleActivity.map((entry, i) => {
                        const style = statusStyle(entry.status);
                        const isLate =
                          entry.status === "Present" &&
                          (parseTimeToMinutes(entry.inTime) ?? -1) > LATE_THRESHOLD_MIN;
                        return (
                          <tr
                            key={entry.id}
                            className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                              i % 2 === 1 ? "bg-slate-50/40" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm">
                                  {entry.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-800">
                                    {entry.name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {entry.employeeId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDateLabel(entry.date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                              <span className="inline-flex items-center gap-1.5">
                                {entry.inTime || "—"}
                                {isLate && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" title="Late arrival" />}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                              {entry.outTime || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-lg px-2.5 py-1 ${style.badge}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredActivity.length > visibleActivity.length && (
                    <p className="text-xs text-slate-400 text-center py-3 border-t border-slate-100">
                      Showing {visibleActivity.length} of {filteredActivity.length} matching records
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;