import { useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

const MONTH_LABEL_FORMAT = { month: "long", year: "numeric" };

// Local YYYY-MM-DD string. Deliberately NOT using
// `date.toISOString().split('T')[0]` — toISOString() converts to UTC first,
// which shifts the calendar date by one day for timezones ahead of UTC
// (e.g. NPT, UTC+5:45) during early-morning hours.
const toLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Local-date parser — new Date("YYYY-MM-DD") parses as UTC and can shift
// by a day for timezones ahead of UTC (same reasoning as toLocalDateString
// above). Always use this for arithmetic on date strings.
const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const getStatus = (log) => {
  if (log.status === "Holiday") return "Holiday";
  if (log.status === "Leave") return "Leave";
  if (log.status === "Present") return "Present";

  return log.outTime ? "Present" : "Absent";
};

// "2026-07-13" -> "2026-07"
const getMonthKey = (dateStr) => dateStr.slice(0, 7);

const monthKeyToLabel = (monthKey) => {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-US", MONTH_LABEL_FORMAT);
};

const shiftMonth = (monthKey, delta) => {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getFilteredSortedLogs = (logs, sortOrder, statusFilter, monthFilter) => {
  const filtered = logs.filter((log) => {
    const matchesStatus = statusFilter === "all" || getStatus(log) === statusFilter;
    const matchesMonth = monthFilter === "all" || getMonthKey(log.date) === monthFilter;
    return matchesStatus && matchesMonth;
  });
  return filtered.sort((a, b) =>
    sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  );
};

export default function ReportInfo({ employee }) {
  const today = toLocalDateString(new Date());
  const currentRealMonth = getMonthKey(today);

  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState(employee.logs || []);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  // Default to the REAL current calendar month, not "all" — otherwise once
  // a new month starts, last month's leave/attendance still shows mixed in
  // under the "all" bucket instead of the modal opening on this month.
  const [monthFilter, setMonthFilter] = useState(currentRealMonth);

  const monthLogs = getFilteredSortedLogs(logs, sortOrder, statusFilter, monthFilter);

  // Grounded on the real current month whenever "All months" isn't
  // explicitly selected — never derived from the latest log's date, which
  // could itself be a stale past-month record.
  const activeMonth = monthFilter !== "all" ? monthFilter : currentRealMonth;

  const goToMonth = (delta) => setMonthFilter(shiftMonth(activeMonth, delta));

  const openModal = async () => {
    setIsOpen(true);

    try {
      setLoadingLogs(true);

      const [attendanceRes, permissionsRes, holidaysRes] = await Promise.all([
        api.get(`${ENDPOINTS.ATTENDANCE}?employeeId=${employee.employeeId}`),
        api.get(`${ENDPOINTS.PERMISSIONS}?employeeId=${employee.employeeId}`),
        api.get(ENDPOINTS.HOLIDAYS),
      ]);

      const attendance = attendanceRes.data || [];
      const permissions = permissionsRes.data || [];
      const holidays = holidaysRes.data || [];

      // This employee's earliest record — attendance OR a permission
      // request — so a new hire whose first-ever action is requesting
      // leave isn't skipped entirely. Days before this shouldn't be
      // treated as "Absent" — they hadn't started using the system yet.
      const employeeFirstDate = (() => {
        const dates = [
          ...attendance.map((a) => a.date),
          ...permissions.map((p) => p.fromDate || p.date),
        ];
        return dates.length > 0
          ? dates.reduce((earliest, d) => (d < earliest ? d : earliest))
          : null;
      })();

      const today = toLocalDateString(new Date());

      // Furthest-out approved leave date, if any — so future months with
      // approved leave actually render instead of showing nothing.
      const latestApprovedLeaveDate = permissions.reduce((latest, p) => {
        if (p.status !== "Approved") return latest;
        const to = p.toDate || p.date;
        return !latest || to > latest ? to : latest;
      }, null);

      const rangeStart = employeeFirstDate || today;
      const rangeEnd =
        latestApprovedLeaveDate && latestApprovedLeaveDate > today
          ? latestApprovedLeaveDate
          : today;

      // Get every date in the full span (not just the current calendar
      // month) so navigating to any past or future month shows a
      // complete day grid, with correct Absent placeholders, rather than
      // only the dates that happen to have a record.
      const allDates = new Set();

      let cursor = parseLocalDate(rangeStart);
      const last = parseLocalDate(rangeEnd);

      while (cursor <= last) {
        allDates.add(toLocalDateString(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }

      attendance.forEach((a) => allDates.add(a.date));
      permissions.forEach((p) => {
        const from = p.fromDate || p.date;
        const to = p.toDate || p.date;
        let d = parseLocalDate(from);
        const permLast = parseLocalDate(to);
        while (d <= permLast) {
          allDates.add(toLocalDateString(d));
          d.setDate(d.getDate() + 1);
        }
      });
      holidays.forEach((h) => allDates.add(h.date));

      const mergedLogs = [...allDates]
        // Drop any date before this employee's first-ever record — nothing
        // (Absent/Holiday/Leave) should be shown for days before they were
        // actually using the system.
        .filter((date) => !employeeFirstDate || date >= employeeFirstDate)
        .sort((a, b) => b.localeCompare(a))
        .map((date) => {
          // Holiday has highest priority
          const holiday = holidays.find((h) => h.date === date);

          if (holiday) {
            return {
              id: `holiday-${date}`,
              date,
              inTime: "",
              outTime: "",
              note: holiday.note || "",
              status: "Holiday",
              title: holiday.title,
            };
          }

          // Approved leave (range-aware, falls back to legacy single `date`)
          const leave = permissions.find((p) => {
            if (p.status !== "Approved") return false;
            const from = p.fromDate || p.date;
            const to = p.toDate || p.date;
            return date >= from && date <= to;
          });

          if (leave) {
            return {
              id: `${leave.id}-${date}`,
              date,
              inTime: "",
              outTime: "",
              note: leave.reason || leave.note || "",
              status: "Leave",
            };
          }

          // Attendance
          const log = attendance.find((a) => a.date === date);

          if (log) {
            // Respect an explicitly-set status (e.g. marked Holiday/Absent
            // via the employee's own attendance page). Only default to
            // "Present" when the record has no status at all.
            return {
              ...log,
              status: log.status || "Present",
            };
          }

          // Absent
          return {
            id: `absent-${date}`,
            date,
            inTime: "",
            outTime: "",
            note: "",
            status: "Absent",
          };
        });

      setLogs(mergedLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";
      case "Holiday":
        return "bg-blue-100 text-blue-700";
      case "Leave":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };
  const closeModal = () => setIsOpen(false);

  return (
    <>
      <tr
        onClick={openModal}
        className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50"
      >
        <td className="px-5 py-4 text-slate-800 font-medium whitespace-nowrap">
          {employee.name}
        </td>
        <td className="px-5 py-4 text-slate-700 text-center">{employee.present}</td>
        <td className="px-5 py-4 text-slate-700 text-center">{employee.absent}</td>
        <td className="px-5 py-4 text-slate-700 text-center">{employee.holiday}</td>
        <td className="px-5 py-4 text-slate-700 text-center">{employee.leave}</td>
        <td className="px-5 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${Math.min(employee.rate, 100)}%` }}
              />
            </div>
            <span className="text-slate-600 text-xs font-medium whitespace-nowrap">
              {employee.rate.toFixed(0)}%
            </span>
          </div>
        </td>
        <td className="px-5 py-4 text-slate-700 text-center whitespace-nowrap">
          {employee.avgHours > 0 ? `${employee.avgHours.toFixed(1)}h` : "—"}
        </td>
        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
          {employee.lastDate || "—"}
        </td>
      </tr>

      {isOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{employee.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {employee.present} present · {employee.absent} absent ·{" "}
                  {employee.holiday} holiday · {employee.rate.toFixed(0)}% attendance rate
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-slate-200 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToMonth(-1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <span className="text-sm font-semibold text-slate-700 w-32 text-center">
                  {monthKeyToLabel(activeMonth)}
                </span>
                <button
                  onClick={() => goToMonth(1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
                  aria-label="Next month"
                >
                  ›
                </button>
                {monthFilter !== "all" && (
                  <button
                    onClick={() => setMonthFilter("all")}
                    className="text-xs font-medium text-slate-400 hover:text-green-600 hover:underline ml-1"
                  >
                    All months
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="all">All</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Leave">Leave</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Sort by date</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Date</th>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">In Time</th>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Out Time</th>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Status</th>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Log</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-10">
                        Loading records...
                      </td>
                    </tr>
                  )}
                  {!loadingLogs && monthLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate-400 py-10">
                        No matching attendance records
                      </td>
                    </tr>
                  )}
                  {!loadingLogs &&
                    monthLogs.map((log) => (
                      <tr
                        key={log.id ?? log.date}
                        className="border-b border-slate-100 last:border-0 align-top"
                      >
                        <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{log.date}</td>
                        <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                          {log.inTime || "—"}
                        </td>
                        <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                          {log.outTime || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(log.status)}`}
                          >
                            {log.status === "Holiday" ? (log.title || "Holiday") : log.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600 max-w-sm">
                          {log.note || "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}