import { Bell, PartyPopper } from "lucide-react";
import { getUpcomingHoliday, formatHolidayRange } from "./utils";

export default function NoticeBoard({ holidays }) {
  const holiday = getUpcomingHoliday(holidays);

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Notice Board
        </h2>
      </div>

      {holiday ? (
        <div className="flex-1 rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex gap-3">
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
        <div className="flex-1 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center py-8 px-4">
          <p className="text-sm text-slate-400">No upcoming holidays right now.</p>
        </div>
      )}
    </div>
  );
}