import { Check, X } from "lucide-react";

export default function PermissionActions({
  permission,
  onApprove,
  onReject,
}) {
  const isPending = permission.status === "Pending";

  return (
    <div className="flex items-center justify-center gap-2">

      <button
        onClick={() => onApprove(permission)}
        disabled={!isPending}
        title="Approve Leave"
        className={`
          p-2 rounded-lg transition
          ${
            isPending
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        <Check size={18} />
      </button>

      <button
        onClick={() => onReject(permission)}
        disabled={!isPending}
        title="Reject Leave"
        className={`
          p-2 rounded-lg transition
          ${
            isPending
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        <X size={18} />
      </button>

    </div>
  );
}