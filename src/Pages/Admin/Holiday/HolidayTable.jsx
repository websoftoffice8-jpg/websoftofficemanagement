import HolidayRow from "./HolidayRow";

export default function HolidayTable({
  holidays,
  handleEdit,
  handleDelete,
}) {
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
            {holidays.length > 0 ? (
              holidays.map((holiday) => (
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