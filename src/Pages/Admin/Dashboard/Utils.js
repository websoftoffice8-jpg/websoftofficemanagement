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

  const isHoliday = holidays.some((h) => h.date === today);

  employeeUsers.forEach((employee) => {
    // Company holiday
    if (isHoliday) {
      holiday++;
      return;
    }

    // Approved leave
    const approvedLeave = permissions.find(
      (p) =>
        p.employeeId === employee.employeeId &&
        p.date === today &&
        p.status === "Approved",
    );

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
      logs.push({
        id: `leave-${permission.id}`,
        employeeId: permission.employeeId,
        name: permission.name,
        date: permission.date,
        inTime: "",
        outTime: "",
        note: permission.reason || "",
        status: "Leave",
      });
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

  return logs
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
