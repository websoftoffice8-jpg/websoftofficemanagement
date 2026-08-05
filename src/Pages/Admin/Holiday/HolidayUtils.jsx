const DATE_FORMAT = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const formatHolidayDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", DATE_FORMAT);
};

export const sortHolidaysByDate = (holidays) => {
  return [...holidays].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
};

export const holidayExists = (holidays, date, editingId = null) => {
  return holidays.some(
    (holiday) =>
      holiday.date === date &&
      holiday.id !== editingId
  );
};

// --- Notices ---
// Notices are announcements rather than day-off entries, so unlike holidays
// they sort newest-first and allow multiple entries on the same date
// (uniqueness is checked on date + title, not date alone).

export const formatNoticeDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", DATE_FORMAT);
};

export const sortNoticesByDate = (notices) => {
  return [...notices].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
};

export const noticeExists = (notices, date, title, editingId = null) => {
  return notices.some(
    (notice) =>
      notice.date === date &&
      notice.title.trim().toLowerCase() === title.trim().toLowerCase() &&
      notice.id !== editingId
  );
};