import { useState } from "react";
import { PartyPopper, Bell, X } from "lucide-react";
import { getTodayOrTomorrowHoliday } from "./utils";

export default function HolidayBanner({ holidays }) {
  const [dismissed, setDismissed] = useState(false);
  const result = getTodayOrTomorrowHoliday(holidays);

  if (!result || dismissed) return null;

  const { when, holiday } = result;
  const name = holiday.title || holiday.name;
  const isToday = when === "today";

  return (
    <div
      className={`relative rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm ring-1 ${
        isToday
          ? "bg-emerald-60 bg-green-600 text-white"
          : "bg-white ring-slate-900/5 text-slate-800"
      }`}
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
          isToday ? "bg-white/15" : "bg-blue-50"
        }`}
      >
        {isToday ? (
          <PartyPopper className="w-5 h-5 text-white" />
        ) : (
          <Bell className="w-5 h-5 text-blue-600" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`font-semibold truncate ${
            isToday ? "text-white" : "text-slate-800"
          }`}
        >
          {isToday
            ? `Today is a holiday — ${name} 🎉`
            : `Tomorrow is a holiday — ${name}`}
        </p>
        <p className={`text-sm mt-0.5 ${isToday ? "text-emerald-50" : "text-slate-500"}`}>
          {isToday ? "Enjoy your day off." : "Plan ahead for tomorrow."}
        </p>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
          isToday
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
      > 
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}