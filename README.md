# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.



 npx json-server --watch db.json --host 0.0.0.0 --port 3000



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