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

// Returns ALL upcoming holidays that share the nearest upcoming date.
// (Previously getUpcomingHoliday returned only a single holiday, which
// silently dropped same-day holidays when more than one existed.)
export function getUpcomingHolidays(holidays = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalized = holidays
    .map((h) => ({
      ...h,
      _from: h.from || h.date,
      _to: h.to || h.date,
      _name: h.title || h.name,
    }))
    .filter((h) => h._from && new Date(h._from) >= today)
    .sort((a, b) => new Date(a._from) - new Date(b._from));

  if (normalized.length === 0) return [];

  const nearestDate = normalized[0]._from;
  return normalized.filter((h) => h._from === nearestDate);
}

// Kept for backward compatibility with any other callers that still
// expect a single holiday object.
export function getUpcomingHoliday(holidays = []) {
  return getUpcomingHolidays(holidays)[0];
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

// ==========================
// Today's Status (Present / Absent / Leave / Holiday)
// ==========================
export function getTodayStatus(attendance, permissions, holidays, employeeId) {
  const today = toLocalDateString(new Date());

  // Holiday takes top priority
  const holidayToday = holidays.find((h) => (h.date || h.from) === today);
  if (holidayToday) {
    return { status: "Holiday", label: holidayToday.title || holidayToday.name };
  }

  // Approved leave covering today (range-aware, falls back to legacy `date`)
  const leaveToday = permissions.find((p) => {
    if (p.employeeId !== employeeId || p.status !== "Approved") return false;
    const from = p.fromDate || p.date;
    const to = p.toDate || p.date;
    return today >= from && today <= to;
  });
  if (leaveToday) return { status: "Leave" };

  // Today's attendance record, if any
  const record = attendance.find(
    (a) => a.employeeId === employeeId && a.date === today
  );
  if (record) {
    const status = record.status || (record.inTime ? "Present" : "Absent");
    return { status };
  }

  // No record yet — day may not be over, don't assume Absent
  return { status: "Not Marked" };
}