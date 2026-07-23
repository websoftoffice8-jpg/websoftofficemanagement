import PermissionRow from "./PermissionRow";

export default function PermissionTable({
  permissions,
  onApprove,
  onReject,
}) {
  if (permissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-500">
          No leave requests found.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">

        <thead className="bg-slate-100 border-b border-slate-200">
          <tr className="text-left text-slate-700">

            <th className="px-5 py-3 font-semibold">
              Employee
            </th>

            <th className="px-5 py-3 font-semibold">
              Date
            </th>

            <th className="px-5 py-3 font-semibold">
              Reason
            </th>

            <th className="px-5 py-3 font-semibold">
              Status
            </th>

            <th className="px-5 py-3 font-semibold text-center">
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
  );
}