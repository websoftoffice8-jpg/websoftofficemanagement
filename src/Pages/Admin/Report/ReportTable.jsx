import ReportInfo from "./ReportInfo";

export const SORT_FIELDS = {
  NAME: "name",
  PRESENT: "present",
  ABSENT: "absent",
  HOLIDAY: "holiday",
  LEAVE: "leave",
  RATE: "rate",
  HOURS: "hours",
};



function SortHeader({
  field,
  sortField,
  sortDir,
  handleSort,
  children,
  align = "left",
}) {
  const alignment = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      onClick={() => handleSort(field)}
      className={`px-5 py-3.5 font-medium text-slate-500 cursor-pointer select-none hover:text-green-600 whitespace-nowrap ${alignment[align]
        }`}
    >
      <span
        className={`flex items-center gap-1 ${align === "right"
          ? "justify-end"
          : align === "center"
            ? "justify-center"
            : "justify-start"
          }`}
      >
        {children}
        {sortField === field && (
          <span>{sortDir === "asc" ? "↑" : "↓"}</span>
        )}
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <SortHeader
              field={SORT_FIELDS.NAME}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
            >
              Employee
            </SortHeader>

            <SortHeader
              field={SORT_FIELDS.PRESENT}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
              align="center"
            >
              Present
            </SortHeader>

            <SortHeader
              field={SORT_FIELDS.ABSENT}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
              align="center"
            >
              Absent
            </SortHeader>

            <SortHeader
              field={SORT_FIELDS.HOLIDAY}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
              align="center"
            >
              Holiday
            </SortHeader>

            <SortHeader
              field={SORT_FIELDS.LEAVE}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
              align="center"
            >
              Leave
            </SortHeader>

            <SortHeader
              field={SORT_FIELDS.RATE}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
              align="center"
            >
              Attendance Rate
            </SortHeader>
            <SortHeader
              field={SORT_FIELDS.HOURS}
              sortField={sortField}
              sortDir={sortDir}
              handleSort={handleSort}
              align="center"
            >
              AVG Hours / Day
            </SortHeader>

            <th className="px-5 py-3.5 text-left font-medium text-slate-500 whitespace-nowrap">
              Last Logged
            </th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-slate-400">
                Loading report...
              </td>
            </tr>
          )}

          {!loading && employees.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-slate-400">
                No matching records found
              </td>
            </tr>
          )}

          {!loading &&

            employees.map((employee) => (
              <ReportInfo
                key={employee.employeeId}
                employee={employee}

              />

            ))}

        </tbody>

      </table>
    </div>
  );
}