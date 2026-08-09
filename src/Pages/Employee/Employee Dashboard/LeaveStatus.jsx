
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { formatLeaveRange } from "./utils";
import { useState } from "react";

const LEAVES_PER_PAGE = 2;

export default function LeaveStatus({ permissions, employeeId }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Get all leave requests for this employee
  const employeeLeaves = permissions
    .filter((permission) => permission.employeeId === employeeId)
    .sort((a, b) => {
      const dateA = new Date(a.fromDate || a.date);
      const dateB = new Date(b.fromDate || b.date);

      return dateB - dateA;
    });

  const totalPages = Math.ceil(
    employeeLeaves.length / LEAVES_PER_PAGE
  );

  const startIndex = (currentPage - 1) * LEAVES_PER_PAGE;

  const currentLeaves = employeeLeaves.slice(
    startIndex,
    startIndex + LEAVES_PER_PAGE
  );

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const statusStyle = {
    Approved: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <FileText size={18} className="text-slate-600" />

        <h2 className="text-base font-semibold text-slate-800">
          Leave Request Status
        </h2>
      </div>

      {/* No leave requests */}
      {employeeLeaves.length === 0 ? (
        <div className="flex-1 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-8 px-4">
          <p className="text-sm text-slate-400">
            You haven't submitted any leave requests.
          </p>
        </div>
      ) : (
        <>
          {/* Leave requests */}
          <div className="space-y-3">
            {currentLeaves.map((leave) => (
              <div
                key={leave.id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Leave Date
                    </p>

                    <p className="text-slate-800 font-semibold mt-0.5 truncate">
                      {formatLeaveRange(
                        leave.fromDate || leave.date,
                        leave.toDate
                      )}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[leave.status] ??
                      "bg-slate-100 text-slate-600"
                      }`}
                  >
                    {leave.status}
                  </span>
                </div>

                {leave.reason && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Reason
                    </p>

                    <p className="text-slate-600 mt-1 text-sm leading-relaxed">
                      {leave.reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

