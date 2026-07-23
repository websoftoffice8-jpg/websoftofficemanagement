// Dashboard Statistics
export function getDashboardStats(
  users = [],
  attendance = [],
  permissions = []
) {
  const today = new Date().toISOString().split("T")[0];

  const employeeUsers = users.filter(
    (user) => user.role === "employee"
  );

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

    leave: todayLeave.length,
  };
}