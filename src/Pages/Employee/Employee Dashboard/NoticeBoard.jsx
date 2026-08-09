
import { useEffect, useState } from "react";
import { Bell, PartyPopper, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { getUpcomingHolidays, formatHolidayRange } from "./utils";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

const NOTICE_DATE_FORMAT = {
  month: "short",
  day: "numeric",
};

const formatNoticeDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", NOTICE_DATE_FORMAT);
};

// Number of notices shown per page
const NOTICES_PER_PAGE = 3;

export default function NoticeBoard({ holidays }) {
  const upcomingHolidays = getUpcomingHolidays(holidays);

  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get(ENDPOINTS.NOTICE);

      // Sort newest notices first
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setNotices(sorted);
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setNoticesLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(notices.length / NOTICES_PER_PAGE);

  const startIndex = (currentPage - 1) * NOTICES_PER_PAGE;
  const endIndex = startIndex + NOTICES_PER_PAGE;

  const currentNotices = notices.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Megaphone size={16} className="text-slate-600" />
        </div>

        <h2 className="text-base font-semibold text-slate-800">
          Notice Board
        </h2>
      </div>

      {/* Notices */}
      {noticesLoading ? (
        <p className="text-sm text-slate-400">
          Loading notices…
        </p>
      ) : notices.length === 0 ? (
        <p className="text-sm text-slate-400">
          No notices right now.
        </p>
      ) : (
        <>
          <ul className="space-y-2.5">
            {currentNotices.map((notice) => (
              <li
                key={notice.id}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">
                  {formatNoticeDate(notice.date)}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {notice.title}
                  </p>

                  {notice.description && (
                    <p className="truncate text-xs text-slate-500">
                      {notice.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

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

