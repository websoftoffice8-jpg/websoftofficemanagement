// src/components/dashboard/sections/RecentAttendanceTable.jsx
// "Recent Attendance" table. Owns its own search/filter state and
// derives its filtered rows locally — Dashboard.jsx just hands it the
// raw attendance list plus a couple of lookup helpers.

import { useMemo, useState } from "react";
import { Search, X, ArrowUpRight, Download } from "lucide-react";
import { STATUS_STYLES, statusStyle, formatDateLabel, parseTimeToMinutes, LATE_THRESHOLD_MIN } from "./utils";

const RecentAttendanceTable = ({ attendance, departments, departmentByEmployeeId, activeDate }) => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    const rows = hasActiveFilters
      ? filteredActivity
      : attendance.filter((a) => a.date === activeDate);
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

  return (
    <div className="dash-animate bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className="flex flex-col gap-3 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Recent Attendance
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              title="Export CSV"
            >
              <Download size={15} />
              Export
            </button>
            <a
              href="/admin/attendance"
              className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              View all
              <ArrowUpRight size={15} />
            </a>
          </div>
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
  );
};

export default RecentAttendanceTable;