import PermissionRow from "./PermissionRow";

export default function PermissionTable({
  permissions,
  onApprove,
  onReject,
}) {
  if (permissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        No leave requests found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Horizontal scroll only when needed */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr className="text-left text-slate-700 text-sm">
              <th className="px-4 sm:px-5 py-3 font-semibold whitespace-nowrap">
                Employee
              </th>

              <th className="px-4 sm:px-5 py-3 font-semibold whitespace-nowrap">
                Date
              </th>

              <th className="px-4 sm:px-5 py-3 font-semibold whitespace-nowrap">
                Reason
              </th>

              <th className="px-4 sm:px-5 py-3 font-semibold whitespace-nowrap">
                Status
              </th>

              <th className="px-4 sm:px-5 py-3 font-semibold text-center whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {permissions.map((permission) => (
              <PermissionRow
                key={permission.id}
                permission={permission}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}