import React, { useEffect, useMemo, useState } from 'react'

// Only these three statuses are shown, in this fixed order, with a
// dedicated color each — order here drives both the ring and the legend.
const STATUS_CONFIG = [
  { key: 'Present', label: 'Present', color: '#16a34a' }, // green-600
  { key: 'Absent', label: 'Absent', color: '#ef4444' },   // red-500
  { key: 'Holiday', label: 'Holiday', color: '#8b5cf6' }, // violet-500
]

const RADIUS = 72
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const DepartmentPieChart = ({ attendance }) => {
  const [status, setStatus] = useState("loading");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!attendance) return;

    if (attendance.length === 0) {
      setRecords([]);
      setStatus("ready");
      return;
    }

    const latestDate = attendance.reduce(
      (max, record) => (record.date > max ? record.date : max),
      attendance[0].date
    );

    setRecords(
      attendance.filter((record) => record.date === latestDate)
    );

    setStatus("ready");
  }, [attendance]);


  // Once data is ready, flip `drawn` on the next frame so the ring
  // animates from empty to its real values instead of popping in.
  useEffect(() => {
    if (status !== 'ready') return
    setDrawn(false)
    const raf = requestAnimationFrame(() => setDrawn(true))
    return () => cancelAnimationFrame(raf)
  }, [status, records])

  const { segments, total, maxCount } = useMemo(() => {
    const counts = STATUS_CONFIG.map(({ key }) =>
      records.filter((r) => r.status === key).length
    )
    const total = counts.reduce((sum, c) => sum + c, 0) || 1
    const maxCount = Math.max(...counts, 1)

    let cumulative = 0
    const segments = STATUS_CONFIG.map((s, i) => {
      const count = counts[i]
      const fraction = count / total
      const dash = fraction * CIRCUMFERENCE
      const offset = -cumulative
      cumulative += dash
      return { ...s, count, fraction, dash, offset }
    })

    return { segments, total, maxCount }
  }, [records])

  const presentCount = segments.find((s) => s.key === 'Present')?.count ?? 0
  const presentPct = Math.round(
    ((segments.find((s) => s.key === 'Present')?.fraction ?? 0) * 100)
  )

  if (status === 'loading') {
    return (
      <div className="flex w-full max-w-sm items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 shadow-sm">
        <span className="text-sm text-slate-400">Loading attendance…</span>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <span className="text-sm font-medium text-slate-600">
          Couldn't load attendance data
        </span>
        <span className="text-xs text-slate-400">
          Check that the API is running and reachable at{' '}
          {ENDPOINTS.ATTENDANCE}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Attendance
        </span>
        <span className="text-xs text-slate-400">{presentPct}% present</span>
      </div>

      <div className="mt-4 flex items-center gap-6">
        {/* Donut ring */}
        <div className="relative shrink-0">
          <svg
            viewBox="0 0 200 200"
            width="150"
            height="150"
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={STROKE}
            />
            {segments.map((s, i) => (
              <circle
                key={s.key}
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={
                  drawn
                    ? `${s.dash} ${CIRCUMFERENCE - s.dash}`
                    : `0 ${CIRCUMFERENCE}`
                }
                strokeDashoffset={s.offset}
                className="transition-[stroke-dasharray] duration-700 ease-out"
                style={{ transitionDelay: `${i * 90}ms` }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {presentCount}/{total}
            </span>
            <span className="text-[11px] text-slate-400">Present today</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-3.5">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm text-slate-600">{s.label}</span>
              <span className="ml-auto text-sm font-semibold tabular-nums text-slate-900">
                {s.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DepartmentPieChart