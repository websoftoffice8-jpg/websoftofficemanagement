// src/components/dashboard/utils.js

// Dashboard Statistics
export function getDashboardStats(
  users = [],
  attendance = [],
  permissions = [],
  holidays = [],
) {
  const today = new Date().toISOString().split("T")[0];

  const employeeUsers = users.filter((user) => user.role === "employee");

  let present = 0;
  let absent = 0;
  let holiday = 0;
  let leave = 0;

  const isHoliday = holidays.some((holiday) => {
    const from = holiday.fromDate || holiday.date;
    const to = holiday.toDate || holiday.date;

    return today >= from && today <= to;
  });

  employeeUsers.forEach((employee) => {
    // Company holiday
    if (isHoliday) {
      holiday++;
      return;
    }

    // Approved leave
    const approvedLeave = permissions.find((p) => {
      if (p.employeeId !== employee.employeeId || p.status !== "Approved") {
        return false;
      }

      const from = p.fromDate || p.date;
      const to = p.toDate || p.date;

      return today >= from && today <= to;
    });

    if (approvedLeave) {
      leave++;
      return;
    }
    // Attendance exists
    const attendanceLog = attendance.find(
      (a) => a.employeeId === employee.employeeId && a.date === today,
    );

    if (attendanceLog) {
      present++;
    } else {
      absent++;
    }
  });

  return {
    totalEmployees: employeeUsers.length,
    present,
    absent,
    holiday,
    leave,
  };
}

// Recent Attendance
export function getRecentAttendance(
  attendance = [],
  permissions = [],
  holidays = [],
) {
  const logs = [];

  attendance.forEach((record) => {
    logs.push({
      ...record,
      status: "Present",
    });
  });

  permissions
    .filter((p) => p.status === "Approved")
    .forEach((permission) => {
      const start = new Date(permission.fromDate || permission.date);
      const end = new Date(permission.toDate || permission.date);

      for (
        let current = new Date(start);
        current <= end;
        current.setDate(current.getDate() + 1)
      ) {
        const date = current.toISOString().split("T")[0];

        logs.push({
          id: `leave-${permission.id}-${date}`,
          employeeId: permission.employeeId,
          name: permission.name,
          date,
          inTime: "",
          outTime: "",
          note: permission.reason || "",
          status: "Leave",
        });
      }
    });

  holidays.forEach((holiday) => {
    logs.push({
      id: `holiday-${holiday.id}`,
      name: "All Employees",
      date: holiday.date,
      inTime: "",
      outTime: "",
      note: holiday.note || "",
      status: "Holiday",
    });
  });

  const today = new Date().toISOString().split("T")[0];

  return logs
    .filter((log) => log.date <= today)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      return (b.inTime || "").localeCompare(a.inTime || "");
    })
    .slice(0, 5);
}

// Format date (2026-07-21 -> Jul 21, 2026)
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
