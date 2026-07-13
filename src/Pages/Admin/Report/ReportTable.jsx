import ReportInfo from "./ReportInfo";

export const SORT_FIELDS = {
  NAME: "name",
  PRESENT: "present",
  ABSENT: "absent",
  RATE: "rate",
  HOURS: "hours",
};

function SortHeader({ field, sortField, sortDir, handleSort, children, align = "left" }) {
  return (
    <th
      onClick={() => handleSort(field)}
      className={`px-5 py-3.5 text-slate-500 font-medium text-${align} cursor-pointer select-none hover:text-green-600 whitespace-nowrap`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </th>
  );
}

export default function ReportTable({
  employees,
  loading,
  sortField,
  sortDir,
  handleSort,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <SortHeader field={SORT_FIELDS.NAME} sortField={sortField} sortDir={sortDir} handleSort={handleSort}>
              Employee
            </SortHeader>
            <SortHeader field={SORT_FIELDS.PRESENT} sortField={sortField} sortDir={sortDir} handleSort={handleSort}>
              Present
            </SortHeader>
            <SortHeader field={SORT_FIELDS.ABSENT} sortField={sortField} sortDir={sortDir} handleSort={handleSort}>
              Absent
            </SortHeader>
            <SortHeader field={SORT_FIELDS.RATE} sortField={sortField} sortDir={sortDir} handleSort={handleSort}>
              Attendance Rate
            </SortHeader>
            <SortHeader field={SORT_FIELDS.HOURS} sortField={sortField} sortDir={sortDir} handleSort={handleSort}>
              Avg Hours / Day
            </SortHeader>
            <th className="text-left px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap">
              Last Logged
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className="text-center text-slate-400 py-10">
                Loading report...
              </td>
            </tr>
          )}

          {!loading && employees.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center text-slate-400 py-10">
                No matching records found   
              </td>
            </tr>
          )}

          {!loading &&
            employees.map((e) => <ReportInfo key={e.employeeId} employee={e} />)}
        </tbody>
      </table>
    </div>
  );
}