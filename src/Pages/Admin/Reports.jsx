import { useState, useEffect} from "react";
import { useMemo } from "react";
import api from "../../API/Axios";
import ENDPOINTS from "../../API/endpoints";


/**
 * Reports (Admin)
 * Aggregates raw attendance logs (across all employees) into a per-employee
 * summary: days present, days absent, attendance rate, and average working hours.
 *
 * Assumes ENDPOINTS.ATTENDANCE returns records shaped like:
 *   { id, employeeId, employeeName?, date, inTime, outTime, note }
 * across ALL employees when queried without an employeeId filter (admin view).
 * If your API scopes by the logged-in user by default, add a query param
 * here (e.g. `${ENDPOINTS.ATTENDANCE}?scope=all`) to match your backend.
 */

const SORT_FIELDS = {
  NAME: "name",
  PRESENT: "present",
  ABSENT: "absent",
  RATE: "rate",
  HOURS: "hours",
};

export default function Reports() {
  const [rawLogs, setRawLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState(SORT_FIELDS.RATE);
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(ENDPOINTS.ATTENDANCE);
      setRawLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  // filter by date range
  const dateFilteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (fromDate && log.date < fromDate) return false;
      if (toDate && log.date > toDate) return false;
      return true;
    });
  }, [rawLogs, fromDate, toDate]);

  // aggregate per employee
  const employeeStats = useMemo(() => {
    const byEmployee = {};

    dateFilteredLogs.forEach((log) => {
      const key = log.employeeId ?? "unknown";
      if (!byEmployee[key]) {
        byEmployee[key] = {
          employeeId: key,
          name: log.employeeName || `Employee ${key}`,
          present: 0,
          absent: 0,
          totalMinutes: 0,
          workedDays: 0,
          lastDate: null,
        };
      }

      const entry = byEmployee[key];
      const isPresent = !!log.outTime;

      if (isPresent) {
        entry.present += 1;
        const [inH, inM] = (log.inTime || "0:0").split(":").map(Number);
        const [outH, outM] = log.outTime.split(":").map(Number);
        let minutes = outH * 60 + outM - (inH * 60 + inM);
        if (minutes < 0) minutes += 24 * 60;
        entry.totalMinutes += minutes;
        entry.workedDays += 1;
      } else {
        entry.absent += 1;
      }

      if (!entry.lastDate || log.date > entry.lastDate) {
        entry.lastDate = log.date;
      }
    });

    return Object.values(byEmployee).map((e) => {
      const total = e.present + e.absent;
      const rate = total > 0 ? (e.present / total) * 100 : 0;
      const avgMinutes = e.workedDays > 0 ? e.totalMinutes / e.workedDays : 0;
      return {
        ...e,
        total,
        rate,
        avgHours: avgMinutes / 60,
      };
    });
  }, [dateFilteredLogs]);

  const filteredAndSorted = useMemo(() => {
    let result = employeeStats.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );

    result.sort((a, b) => {
      let diff = 0;
      switch (sortField) {
        case SORT_FIELDS.NAME:
          diff = a.name.localeCompare(b.name);
          break;
        case SORT_FIELDS.PRESENT:
          diff = a.present - b.present;
          break;
        case SORT_FIELDS.ABSENT:
          diff = a.absent - b.absent;
          break;
        case SORT_FIELDS.HOURS:
          diff = a.avgHours - b.avgHours;
          break;
        case SORT_FIELDS.RATE:
        default:
          diff = a.rate - b.rate;
      }
      return sortDir === "asc" ? diff : -diff;
    });

    return result;
  }, [employeeStats, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // org-wide summary
  const summary = useMemo(() => {
    const totalEmployees = employeeStats.length;
    const totalPresent = employeeStats.reduce((sum, e) => sum + e.present, 0);
    const totalAbsent = employeeStats.reduce((sum, e) => sum + e.absent, 0);
    const totalRecords = totalPresent + totalAbsent;
    const avgRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
    const avgHours =
      employeeStats.length > 0
        ? employeeStats.reduce((sum, e) => sum + e.avgHours, 0) / employeeStats.length
        : 0;

    return { totalEmployees, totalPresent, totalAbsent, avgRate, avgHours };
  }, [employeeStats]);

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  const SortHeader = ({ field, children, align = "left" }) => (
    <th
      onClick={() => handleSort(field)}
      className={`px-5 py-3.5 text-slate-500 font-medium text-${align} cursor-pointer select-none hover:text-green-600 whitespace-nowrap`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </th>
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-1">Attendance Reports</h1>
      <p className="text-slate-500 text-sm mb-8">
        Overview of employee attendance, sortable and filterable by date range.
      </p>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Employees Tracked" value={summary.totalEmployees} />
        <SummaryCard
          label="Attendance Rate"
          value={`${summary.avgRate.toFixed(1)}%`}
          accent
        />
        <SummaryCard label="Total Present Days" value={summary.totalPresent} />
        <SummaryCard
          label="Avg Working Hours"
          value={`${summary.avgHours.toFixed(1)}h`}
        />
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Search employee
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>

        {(search || fromDate || toDate) && (
          <button
            onClick={clearFilters}
            className="mt-3 text-xs font-medium text-slate-400 hover:text-green-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <SortHeader field={SORT_FIELDS.NAME}>Employee</SortHeader>
              <SortHeader field={SORT_FIELDS.PRESENT}>Present</SortHeader>
              <SortHeader field={SORT_FIELDS.ABSENT}>Absent</SortHeader>
              <SortHeader field={SORT_FIELDS.RATE}>Attendance Rate</SortHeader>
              <SortHeader field={SORT_FIELDS.HOURS}>Avg Hours / Day</SortHeader>
              <th className="text-left px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                Last Logged
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-10">
                  Loading report...
                </td>
              </tr>
            )}

            {!loading && filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 py-10">
                  No matching records found
                </td>
              </tr>
            )}

            {!loading &&
              filteredAndSorted.map((e) => (
                <tr
                  key={e.employeeId}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-5 py-4 text-slate-800 font-medium whitespace-nowrap">
                    {e.name}
                  </td>
                  <td className="px-5 py-4 text-slate-700">{e.present}</td>
                  <td className="px-5 py-4 text-slate-700">{e.absent}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${Math.min(e.rate, 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs font-medium whitespace-nowrap">
                        {e.rate.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700 whitespace-nowrap">
                    {e.avgHours > 0 ? `${e.avgHours.toFixed(1)}h` : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {e.lastDate || "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent = false }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-green-600" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}