// src/components/dashboard/Dashboard.jsx
// Orchestrator only: fetches data, computes derived state shared across
// multiple sections, and lays sections out. Each section's own render
// logic (and bugs!) live in its own file under ./sections, so you can
// open exactly the one piece you need — e.g. sections/AttendanceDonutChart.jsx
// for the pie chart, sections/RecentAttendanceTable.jsx for the table.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

import { LATE_THRESHOLD_MIN, todayISO, formatDayShort, formatDateLabel, parseTimeToMinutes } from "./utils";
import DashboardHeader from "./DashboardHeader";
import StatCards from "./StatCards";
import AttendanceDonutChart from "./AttendanceDonutChart";
import WeeklyTrendChart from "./WeeklyTrendChart";

import RecentAttendanceTable from "./RecentAttendanceTable";

import { STATUS_STYLES } from "./utils";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [error, setError] = useState(null);

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
   
    const late = todaysRecords.filter(
      (a) => a.status === "Present" && (parseTimeToMinutes(a.inTime) ?? -1) > LATE_THRESHOLD_MIN
    ).length;
    const marked = todaysRecords.length;
    const rate = marked > 0 ? Math.round((present / marked) * 100) : 0;

    return {
      totalStaff: staff.length,
      present,
      absent,
      holiday,
      
      late,
      marked,
      rate,
    };
  }, [todaysRecords, staff]);

  // Average check-in time across everyone marked Present today.
  const avgCheckInMinutes = useMemo(() => {
    const minutes = todaysRecords
      .filter((a) => a.status === "Present")
      .map((a) => parseTimeToMinutes(a.inTime))
      .filter((m) => m !== null);
    if (minutes.length === 0) return null;
    return Math.round(minutes.reduce((sum, m) => sum + m, 0) / minutes.length);
  }, [todaysRecords]);

  // Staff who checked in today but haven't checked out yet.
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
       
        { name: "Holiday", value: stats.holiday, color: STATUS_STYLES.Holiday.hex },
      ].filter((d) => d.value > 0),
    [stats]
  );

  // Every distinct date recorded, oldest → newest, broken down by status —
  // used for the 7-day bar chart.
  const attendanceByDate = useMemo(() => {
    return attendance.reduce((acc, a) => {
      if (!a.date) return acc;
      acc[a.date] = acc[a.date] || { Present: 0, Absent: 0,  Holiday: 0, total: 0 };
      if (acc[a.date][a.status] !== undefined) acc[a.date][a.status] += 1;
      acc[a.date].total += 1;
      return acc;
    }, {});
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

  const rateVsWeeklyAvg =
    weeklyAverageRate === null ? null : stats.rate - weeklyAverageRate;

  const showAbsenteeAlert = stats.marked > 0 && stats.absent / stats.marked >= 0.2;

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

      <DashboardHeader
        activeDate={activeDate}
        stats={stats}
        rateVsWeeklyAvg={rateVsWeeklyAvg}
        
        onRefresh={() => fetchData({ silent: true })}
        error={error}
        showAbsenteeAlert={!isLoading && showAbsenteeAlert}
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-24">
          <Loader2 size={18} className="animate-spin" />
          Loading dashboard...
        </div>
      ) : (
        <>
          <StatCards stats={stats} departmentCount={departments.length} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <AttendanceDonutChart pieData={pieData} rate={stats.rate} marked={stats.marked} />
            </div>
            <div className="lg:col-span-8">
              <WeeklyTrendChart weeklyTrend={weeklyTrend} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
            <div className="lg:col-span-7">
              <RecentAttendanceTable
                attendance={attendance}
                departments={departments}
                departmentByEmployeeId={departmentByEmployeeId}
                activeDate={activeDate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;