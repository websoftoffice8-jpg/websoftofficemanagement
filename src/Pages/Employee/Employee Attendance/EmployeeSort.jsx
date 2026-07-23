const MONTH_LABEL_FORMAT = { month: "long", year: "numeric" };

// "2026-07-13" -> "2026-07"
export const getMonthKey = (dateStr) => dateStr.slice(0, 7);

export const getStatus = (log) => {
  if (log.status === "Holiday") return "Holiday";
  if (log.status === "Leave") return "Leave";
  if (!log.outTime) return "Absent";
  return "Present";
};

// builds every date in the given "YYYY-MM" month, but only between the
// employee's first-ever log date and today — no days before they started,
// no future days — filling any gap with an "absent" placeholder entry
const buildMonthLogs = (logs, monthKey) => {
  if (logs.length === 0) return [];

  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split("T")[0];
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
    if (dateStr < firstLogDate) continue; // before employee's first entry
    if (dateStr > today) break; // future day

    result.push(
      logsByDate[dateStr] || {
        id: `missing-${dateStr}`,
        date: dateStr,
        inTime: null,
        outTime: null,
        note: "",
        status: undefined,
      }
    );
  }
  return result;
};

// filters logs to the selected "YYYY-MM" month + status, and sorts by date
// — missing dates (within the employee's active range) are treated as "Absent"
export const getFilteredSortedLogs = (logs, selectedMonth, sortOrder, statusFilter = "all") => {
  const monthLogs = buildMonthLogs(logs, selectedMonth);
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