import { useState, useEffect, useMemo } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import ReportHeader from "./ReportHeader";
import ReportSort from "./SortReport";
import ReportTable, { SORT_FIELDS } from "./ReportTable";

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
          name: log.name || `Employee ${key}`,
          present: 0,
          absent: 0,
          holiday: 0,
          totalMinutes: 0,
          workedDays: 0,
          lastDate: null,
          logs: [],
        };
      }

      const entry = byEmployee[key];
      entry.logs.push(log);
      const isPresent = !!log.outTime;

      if (log.status === "Holiday") {
        entry.holiday += 1;
      } else if (log.outTime) {
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
      const total = e.present + e.absent + e.holiday;
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
        case SORT_FIELDS.HOLIDAY:
          diff = a.holiday - b.holiday;
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

      <ReportHeader summary={summary} />

      <ReportSort
        search={search}
        setSearch={setSearch}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        clearFilters={clearFilters}
      />

      <ReportTable
        employees={filteredAndSorted}
        loading={loading}
        sortField={sortField}
        sortDir={sortDir}
        handleSort={handleSort}
      />
    </div>
  );
}