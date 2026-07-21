// src/components/dashboard/sections/utils.js
// Shared constants + pure helper functions used by every dashboard section.
// Keeping these in one place means the pie chart, bar chart, tables, and
// stat cards can never drift out of sync on colors or date formatting.

export const STATUS_STYLES = {
  Present: { hex: "#16a34a", dot: "bg-green-600", badge: "bg-green-50 text-green-700 border-green-200" },
  Absent: { hex: "#ef4444", dot: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
  Holiday: { hex: "#3b82f6", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200" },
 
};

export const statusStyle = (status) =>
  STATUS_STYLES[status] || { hex: "#94a3b8", dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200" };

// A staff member arriving after this time (24h minutes) counts as "late".
// Tweak to match your organization's grace period.
export const LATE_THRESHOLD_MIN = 9 * 60 + 30; // 09:30

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDateLabel = (isoDate) =>
  new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

export const formatDayShort = (isoDate) =>
  new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// Parses "09:15", "9:15 AM", "09:15 PM" etc. into minutes-since-midnight.
// Returns null if the string can't be read, so callers can skip it safely.
export const parseTimeToMinutes = (t) => {
  if (!t || typeof t !== "string") return null;
  const match = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let [, hh, mm, ap] = match;
  hh = parseInt(hh, 10);
  mm = parseInt(mm, 10);
  if (ap) {
    ap = ap.toUpperCase();
    if (ap === "PM" && hh !== 12) hh += 12;
    if (ap === "AM" && hh === 12) hh = 0;
  }
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
};

export const formatMinutes = (mins) => {
  if (mins === null || mins === undefined || Number.isNaN(mins)) return "—";
  const hh24 = Math.floor(mins / 60);
  const mm = String(mins % 60).padStart(2, "0");
  const ap = hh24 >= 12 ? "PM" : "AM";
  const hh12 = hh24 % 12 === 0 ? 12 : hh24 % 12;
  return `${hh12}:${mm} ${ap}`;
};

// Green-tinted heat scale for the monthly overview — darker means a
// higher share of staff were present that day.
export const heatColor = (rate) => {
  if (rate === null || rate === undefined) return "#f1f5f9";
  const opacity = Math.max(0.14, Math.min(1, rate / 100));
  return `rgba(22, 163, 74, ${opacity})`;
};