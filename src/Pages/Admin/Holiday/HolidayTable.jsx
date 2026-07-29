import HolidayRow from "./HolidayRow";

// Local date +1 day, as a YYYY-MM-DD string (no UTC-shift issues since we
// only ever operate on plain date strings here, not Date "now" instants).
const nextDateStr = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Collapses consecutive-day holidays that share the same title + description
// into a single "range" entry, e.g. a week-long festival added via the
// From/To picker shows as one row instead of 7.
const groupConsecutiveHolidays = (holidays) => {
  if (holidays.length === 0) return [];

  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  const groups = [];
  let current = null;

  sorted.forEach((h) => {
    const sameSeries =
      current &&
      h.title === current.title &&
      (h.description || "") === (current.description || "") &&
      nextDateStr(current.endDate) === h.date;

    if (sameSeries) {
      current.endDate = h.date;
      current.ids.push(h.id);
    } else {
      current = {
        id: h.id,
        ids: [h.id],
        date: h.date,
        endDate: h.date,
        title: h.title,
        description: h.description,
      };
      groups.push(current);
    }
  });

  // Preserve whichever sort order (asc/desc) the incoming list was in.
  const wasDescending =
    holidays.length > 1 && holidays[0].date > holidays[holidays.length - 1].date;

  return wasDescending ? groups.reverse() : groups;
};

export default function HolidayTable({
  holidays,
  handleEdit,
  handleDelete,
}) {
  const rows = groupConsecutiveHolidays(holidays);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Date
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Holiday
              </th>

              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                Description
              </th>

              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-40">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {rows.length > 0 ? (
              rows.map((holiday) => (
                <HolidayRow
                  key={holiday.id}
                  holiday={holiday}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  No holidays added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}