// ==========================
// Greeting
// ==========================
export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";

  return "Good Evening";
}

// ==========================
// Today's Date
// ==========================
export function formatToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ==========================
// Avatar initials, 
// ==========================
export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ==========================
// Holiday
// ==========================
export function getUpcomingHoliday(holidays = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return holidays
    .map((h) => ({
      ...h,
      _from: h.from || h.date,
      _to: h.to || h.date,
      _name: h.title || h.name,
    }))
    .filter((h) => h._from && new Date(h._from) >= today)
    .sort((a, b) => new Date(a._from) - new Date(b._from))[0];
}

export function formatHolidayRange(from, to) {
  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  if (!to || from === to) {
    return new Date(from).toLocaleDateString("en-US", options);
  }

  return `${new Date(from).toLocaleDateString(
    "en-US",
    options
  )} - ${new Date(to).toLocaleDateString("en-US", options)}`;
}

// ==========================
// Employee Stats
// ==========================
export function getEmployeeStats(attendance, permissions, employeeId) {
  const employeeAttendance = attendance.filter(
    (item) => item.employeeId === employeeId
  );

  const getRecordStatus = (a) =>
    a.status || (a.inTime ? "Present" : "Absent");

  const present = employeeAttendance.filter(
    (a) => getRecordStatus(a) === "Present"
  ).length;

  const absent = employeeAttendance.filter(
    (a) => getRecordStatus(a) === "Absent"
  ).length;

  const leave = permissions.filter(
    (item) => item.employeeId === employeeId && item.status === "Approved"
  ).length;

  const totalWorkingDays = present + absent;

  const attendanceRate =
    totalWorkingDays === 0
      ? 0
      : Math.round((present / totalWorkingDays) * 100);

  return {
    present,
    absent,
    leave,
    attendanceRate,
  };
}

// ==========================
// Leave
// ==========================
export function getLatestLeave(permissions, employeeId) {
  const employeePermissions = permissions
    .filter((item) => item.employeeId === employeeId)
    .sort((a, b) => {
      const aDate = a.requestedAt || a.fromDate;
      const bDate = b.requestedAt || b.fromDate;
      return new Date(bDate) - new Date(aDate);
    });

  return employeePermissions[0] || null;
}

export function formatLeaveRange(fromDate, toDate) {
  const options = { month: "long", day: "numeric", year: "numeric" };

  if (!toDate || fromDate === toDate) {
    return new Date(fromDate).toLocaleDateString("en-US", options);
  }

  return `${new Date(fromDate).toLocaleDateString(
    "en-US",
    options
  )} – ${new Date(toDate).toLocaleDateString("en-US", options)}`;
}

// ==========================
// Today / Tomorrow Holiday
// ==========================
export function toLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Returns { when: "today" | "tomorrow", holiday } or null.
// Matches on `date` (single-day holiday) or `from` (range start),
// same fallback pattern used elsewhere in the app.
export function getTodayOrTomorrowHoliday(holidays = []) {
  const today = toLocalDateString(new Date());

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = toLocalDateString(tomorrowDate);

  const matchDate = (h) => h.date || h.from;

  const todayHoliday = holidays.find((h) => matchDate(h) === today);
  if (todayHoliday) return { when: "today", holiday: todayHoliday };

  const tomorrowHoliday = holidays.find((h) => matchDate(h) === tomorrow);
  if (tomorrowHoliday) return { when: "tomorrow", holiday: tomorrowHoliday };

  return null;
}