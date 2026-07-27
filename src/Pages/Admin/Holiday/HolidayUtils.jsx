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