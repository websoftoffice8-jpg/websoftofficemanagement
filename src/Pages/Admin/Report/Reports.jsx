import { useState, useEffect, useMemo } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";
import ReportHeader from "./ReportHeader";
import ReportSort from "./SortReport";
import ReportTable, { SORT_FIELDS } from "./ReportTable";

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState(SORT_FIELDS.RATE);
  const [sortDir, setSortDir] = useState("desc");


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        employeesRes,
        attendanceRes,
        permissionsRes,
        holidaysRes,
      ] = await Promise.all([
        api.get(ENDPOINTS.EMPLOYEES),
        api.get(ENDPOINTS.ATTENDANCE),
        api.get(ENDPOINTS.PERMISSIONS),
        api.get(ENDPOINTS.HOLIDAYS),
      ]);

      setEmployees(
        (employeesRes.data || []).filter(
          (user) => user.role === "employee"
        )
      );

      setAttendance(attendanceRes.data || []);
      setPermissions(permissionsRes.data || []);
      setHolidays(holidaysRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Couldn't load attendance records.");
    } finally {
      setLoading(false);
    }
  };




  const getDatesInRange = (start, end) => {
    const dates = [];

    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };
  const employeeStats = useMemo(() => {
    if (employees.length === 0) return [];

    const today = new Date().toISOString().split("T")[0];

    const start =
      fromDate ||
      attendance.reduce(
        (earliest, log) =>
          !earliest || log.date < earliest ? log.date : earliest,
        today
      );

    const end = toDate || today;

    const dates = getDatesInRange(start, end);

    return employees.map((employee) => {
      let present = 0;
      let absent = 0;
      let holiday = 0;
      let leave = 0;

      let totalMinutes = 0;
      let workedDays = 0;

      dates.forEach((date) => {
        const holidayExists = holidays.some((h) => h.date === date);

        if (holidayExists) {
          holiday++;
          return;
        }

        const approvedLeave = permissions.find(
          (p) =>
            p.employeeId === employee.employeeId &&
            p.date === date &&
            p.status === "Approved"
        );

        if (approvedLeave) {
          leave++;
          return;
        }

        const attendanceLog = attendance.find(
          (a) =>
            a.employeeId === employee.employeeId &&
            a.date === date
        );

        if (attendanceLog) {
          present++;

          if (attendanceLog.inTime && attendanceLog.outTime) {
            const [inH, inM] = attendanceLog.inTime.split(":").map(Number);
            const [outH, outM] = attendanceLog.outTime.split(":").map(Number);

            let minutes =
              outH * 60 +
              outM -
              (inH * 60 + inM);

            if (minutes < 0) minutes += 24 * 60;

            totalMinutes += minutes;
            workedDays++;
          }

          return;
        }

        absent++;
      });

      const total = present + absent + holiday + leave;

      return {
        employeeId: employee.employeeId,
        name: employee.name,
        present,
        absent,
        holiday,
        leave,
        total,
        totalMinutes,
        avgHours: workedDays > 0 ? totalMinutes / workedDays / 60 : 0,
        rate: total > 0 ? (present / total) * 100 : 0,
      };
    });
  }, [
    employees,
    attendance,
    permissions,
    holidays,
    fromDate,
    toDate,
  ]);

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
        case SORT_FIELDS.LEAVE:
          diff = a.leave - b.leave;
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

  const summary = useMemo(() => {
    const totalEmployees = employeeStats.length;

    const totalPresent = employeeStats.reduce((sum, e) => sum + e.present, 0);
    const totalAbsent = employeeStats.reduce((sum, e) => sum + e.absent, 0);
    const totalHoliday = employeeStats.reduce((sum, e) => sum + e.holiday, 0);
    const totalLeave = employeeStats.reduce((sum, e) => sum + e.leave, 0);

    const totalRecords =
      totalPresent +
      totalAbsent +
      totalHoliday +
      totalLeave;

    const avgRate =
      totalRecords > 0
        ? (totalPresent / totalRecords) * 100
        : 0;

    const avgHours =
      totalEmployees > 0
        ? employeeStats.reduce((sum, e) => sum + e.avgHours, 0) /
        totalEmployees
        : 0;

    return {
      totalEmployees,
      totalPresent,
      totalAbsent,
      totalHoliday,
      totalLeave,
      avgRate,
      avgHours,
    };
  }, [employeeStats]);

  const clearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
  };

  return (
  <div className="max-w-6xl mx-auto p-8">
    <h1 className="text-3xl font-bold text-slate-800 mb-1">
      Attendance Reports
    </h1>

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