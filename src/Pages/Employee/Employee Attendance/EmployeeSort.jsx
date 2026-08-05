const MONTH_LABEL_FORMAT = { month: "long", year: "numeric" };

export const toLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Parses "YYYY-MM-DD" as a *local* date, same reasoning as toLocalDateString:
// `new Date("2026-07-29")` is parsed as UTC and can shift a day in some
// timezones. Used anywhere we need to do date math on a permission range.
const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// "2026-07-13" -> "2026-07"
export const getMonthKey = (dateStr) => dateStr.slice(0, 7);

export const getStatus = (log) => {
  if (log.status) return log.status;
  if (log.inTime) return "Present";
  return "Absent";
};

// Inclusive day count between fromDate/toDate.
export const getPermissionDays = (fromDate, toDate) => {
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate || fromDate);
  const diffDays = Math.round((to - from) / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

// "2026-07-25", "2026-07-27" -> "Jul 25 – Jul 27, 2026"
// Falls back gracefully to a single date when fromDate === toDate.
export const formatDateRange = (fromDate, toDate) => {
  if (!toDate || fromDate === toDate) {
    return parseLocalDate(fromDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  const sameYear = from.getFullYear() === to.getFullYear();

  const fromLabel = from.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const toLabel = to.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${fromLabel} – ${toLabel}`;
};

const buildMonthLogs = (logs, permissions, holidays, monthKey) => {
  if (logs.length === 0) return [];

  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = toLocalDateString(new Date());
  const firstLogDate = logs.reduce(
    (earliest, log) => (log.date < earliest ? log.date : earliest),
    logs[0].date
  );

  const logsByDate = {};
  logs.forEach((log) => {
    if (getMonthKey(log.date) === monthKey) {
      logsByDate[log.date] = log;
    }
  });

  const result = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (dateStr < firstLogDate) continue;
    if (dateStr > today) break;

    const attendance = logsByDate[dateStr];

    if (attendance) {
      result.push(attendance);
      continue;
    }

    const holiday = holidays.find((h) => h.date === dateStr);

    if (holiday) {
      result.push({
        id: `holiday-${dateStr}`,
        date: dateStr,
        status: holiday.title === "Saturday" ? "Saturday" : "Holiday",
        title: holiday.title,
        inTime: null,
        outTime: null,
        note: holiday.description || "",
      });

      continue;
    }

    // Range-aware: falls back to legacy `p.date` for old single-date records
    const approvedLeave = permissions.find((p) => {
      if (p.status !== "Approved") return false;
      const from = p.fromDate || p.date;
      const to = p.toDate || p.date;
      return dateStr >= from && dateStr <= to;
    });

    if (approvedLeave) {
      result.push({
        id: `leave-${dateStr}`,
        date: dateStr,
        status: "Leave",
        inTime: null,
        outTime: null,
        note: approvedLeave.reason || "",
      });
      continue;
    }

    result.push({
      id: `missing-${dateStr}`,
      date: dateStr,
      inTime: null,
      outTime: null,
      note: "",
    });
  }
  return result;
};

export const getFilteredSortedLogs = (
  logs,
  permissions,
  holidays,
  selectedMonth,
  sortOrder,
  statusFilter = "all"
) => {
  const monthLogs = buildMonthLogs(logs, permissions, holidays, selectedMonth);

  const filtered = monthLogs.filter(
    (log) => statusFilter === "all" || getStatus(log) === statusFilter
  );
  return filtered.sort((a, b) =>
    sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  );
};

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

export default function EmployeeSort({
  selectedMonth,
  setSelectedMonth,
  sortOrder,
  setSortOrder,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedMonth((prev) => shiftMonth(prev, -1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-700 w-36 text-center">
          {monthKeyToLabel(selectedMonth)}
        </span>
        <button
          onClick={() => setSelectedMonth((prev) => shiftMonth(prev, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50"
          aria-label="Next month"
        >
          ›
        </button>
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
  );
}