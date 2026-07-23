// src/components/dashboard/utils.js

// Dashboard Statistics
export function getDashboardStats(users = [], attendance = [], permissions = []) {
  const today = new Date().toISOString().split("T")[0];

  // Count only employee accounts
  const employeeUsers = users.filter(
    (user) => user.role === "employee"
  );

  // Filter today's attendance
  const todayAttendance = attendance.filter(
    (record) => record.date === today
  );


  const todayLeave = permissions.filter(
    (permission) =>
      permission.date === today &&
      permission.status === "Approved"
  );
  return {
    totalEmployees: employeeUsers.length,

    present: todayAttendance.filter(
      (record) => record.status === "Present"
    ).length,

    absent: todayAttendance.filter(
      (record) => record.status === "Absent"
    ).length,

    holiday: todayAttendance.filter(
      (record) => record.status === "Holiday"
    ).length,
    
    leave: todayLeave.length,
  };

}

// Recent Attendance
export function getRecentAttendance(attendance = []) {
  return [...attendance]
    .sort((a, b) => {
      // Sort by newest date first
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      // If same date, latest inTime first
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