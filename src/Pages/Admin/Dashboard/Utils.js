// src/components/dashboard/utils.js

export function getDashboardStats(users = [], attendance = []) {
  const today = new Date().toISOString().split("T")[0];

  // Count only employee accounts
  const employeeUsers = users.filter(
    (user) => user.role === "employee"
  );

  // Today's attendance only
  const todayAttendance = attendance.filter(
    (record) => record.date === today
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
  };
}