import { useState } from "react";
import { PartyPopper, Bell, X } from "lucide-react";
import { getLatestHoliday } from "./utils";

export default function HolidayBanner({ holidays }) {
  const [dismissed, setDismissed] = useState(false);

  const holiday = getLatestHoliday(holidays);

  if (!holiday || dismissed) return null;

  const name = holiday.title || holiday.name;

  return (
    <div className="relative rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm ring-1 bg-white ring-slate-900/5 text-slate-800">
      <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center bg-blue-50">
        <Bell className="w-5 h-5 text-blue-600" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate text-slate-800">
          Upcoming holiday — {name}
        </p>

        <p className="text-sm mt-0.5 text-slate-500">
          {new Date(holiday.date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}