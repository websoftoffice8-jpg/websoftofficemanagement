import PermissionActions from "./PermissionActions";

export default function PermissionRow({
  permission,
  onApprove,
  onReject,
}) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Pending":
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition">

      <td className="px-5 py-4">
        <div className="font-medium text-slate-800">
          {permission.name}
        </div>

        <div className="text-xs text-slate-400">
          {permission.employeeId}
        </div>
      </td>

      <td className="px-5 py-4 text-slate-600">
        {permission.date}
      </td>

      <td className="px-5 py-4 text-slate-600 max-w-xs">
        {permission.reason || "-"}
      </td>

      <td className="px-5 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
            permission.status
          )}`}
        >
          {permission.status}
        </span>
      </td>

      <td className="px-5 py-4">
        <PermissionActions
          permission={permission}
          onApprove={onApprove}
          onReject={onReject}
        />
      </td>

    </tr>
  );
}