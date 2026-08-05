import { useEffect, useState } from "react";
import { Bell, PartyPopper, Megaphone } from "lucide-react";
import { getUpcomingHoliday, formatHolidayRange } from "./utils";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

const NOTICE_DATE_FORMAT = {
  month: "short",
  day: "numeric",
};

const formatNoticeDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", NOTICE_DATE_FORMAT);
};

// How many recent notices to show on the board.
const MAX_NOTICES = 3;

export default function NoticeBoard({ holidays }) {
  const holiday = getUpcomingHoliday(holidays);

  const [notices, setNotices] = useState([]);
  const [noticesLoading, setNoticesLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get(ENDPOINTS.NOTICE);

      const sorted = [...res.data].sort((a, b) =>
        b.date.localeCompare(a.date)
      );

      setNotices(sorted.slice(0, MAX_NOTICES));
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setNoticesLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Notice Board
        </h2>
      </div>

      {holiday ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex gap-3">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-100 flex items-center justify-center">
            <PartyPopper className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Upcoming Holiday
            </p>
            <p className="mt-1 text-slate-800 font-semibold truncate">
              {holiday._name}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {formatHolidayRange(holiday._from, holiday._to)}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-8 px-4">
          <p className="text-sm text-slate-400">No upcoming holidays right now.</p>
        </div>
      )}

      <div className="mt-4 flex-1 rounded-xl border border-slate-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Latest Notices
          </p>
        </div>

        {noticesLoading ? (
          <p className="text-sm text-slate-400">Loading notices…</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-slate-400">No notices right now.</p>
        ) : (
          <ul className="space-y-2.5">
            {notices.map((notice) => (
              <li key={notice.id} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5">
                  {formatNoticeDate(notice.date)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">
                    {notice.title}
                  </p>
                  {notice.description && (
                    <p className="text-xs text-slate-500 truncate">
                      {notice.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}