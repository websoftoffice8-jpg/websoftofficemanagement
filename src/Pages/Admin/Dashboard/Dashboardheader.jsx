// src/components/dashboard/sections/DashboardHeader.jsx
// The "Good morning, Admin" hero, plus the error banner and absentee
// alert that live in the header area. Isolated here so header-only
// changes (copy, gradient, badges) never touch chart or table code.

import { LayoutGrid, TrendingUp, TrendingDown,  AlertCircle, AlertTriangle } from "lucide-react";
import { formatDateLabel, greeting } from "./utils";

const DashboardHeader = ({
  activeDate,
  stats,
  rateVsWeeklyAvg,
  error,
  showAbsenteeAlert,
}) => {
  return (
    <>
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-600 to-emerald-800 px-6 py-7 sm:px-8 sm:py-8 shadow-lg shadow-green-900/10 dash-animate">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-6 bottom-0 h-40 w-40 rounded-full bg-emerald-300/20 blur-2xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/25 flex items-center justify-center shrink-0">
              <LayoutGrid size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  {greeting()}, Admin
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-medium text-white/90 bg-white/15 rounded-full px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-green-100/90 text-sm mt-1">
                Attendance overview for {formatDateLabel(activeDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {rateVsWeeklyAvg !== null && (
              <div
                className={`hidden sm:flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg backdrop-blur-sm ${
                  rateVsWeeklyAvg >= 0 ? "bg-white/15 text-white" : "bg-red-500/20 text-red-50"
                }`}
              >
                {rateVsWeeklyAvg >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {Math.abs(rateVsWeeklyAvg)}pt vs weekly avg
              </div>
            )}
            <div className="flex items-center gap-2 bg-white text-green-700 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm">
              <TrendingUp size={16} />
              {stats.rate}% attendance
            </div>
            
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mt-6">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {/* Absentee alert — surfaces automatically when absences run high */}
      {showAbsenteeAlert && (
        <div className="flex items-center gap-2.5 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mt-6 dash-animate">
          <AlertTriangle size={17} className="shrink-0" />
          <span>
            <span className="font-semibold">{stats.absent}</span> of {stats.marked} staff are absent today
            ({Math.round((stats.absent / stats.marked) * 100)}%) — above the usual range.
          </span>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;