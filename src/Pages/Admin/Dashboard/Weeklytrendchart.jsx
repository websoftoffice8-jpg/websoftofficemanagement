import React, { useEffect, useMemo, useState } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../../API/Axios'
import ENDPOINTS from '../../../API/endpoints'

// Note: Holiday is still tracked internally (see resolveDailyStatus /
// the Holiday bucket below) so holiday days correctly skip Present/
// Absent/Leave counting — it's just not rendered as its own bar/legend
// entry here.
const STATUS_CONFIG = [
    { key: 'Present', label: 'Present', color: '#16a34a' },
    { key: 'Absent', label: 'Absent', color: '#ef4444' },
    { key: 'Leave', label: 'Leave', color: '#8b5cf6' },
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Midnight of the Sunday that starts the current week (local time)
const getStartOfCurrentWeek = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    start.setDate(start.getDate() - start.getDay()) // getDay(): 0 = Sunday
    return start
}

// IMPORTANT: don't use toISOString() here — it converts to UTC first,
// which shifts the date backwards for any timezone ahead of UTC
// (e.g. local midnight in Nepal/UTC+5:45 becomes the previous day in UTC).
// This formats using the LOCAL calendar date, matching how dates are
// stored in the JSON ("YYYY-MM-DD").
const toLocalISODate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

const formatRange = (start, end) => {
    const opts = { month: 'short', day: 'numeric' }
    const startLabel = start.toLocaleDateString(undefined, opts)
    const endLabel = end.toLocaleDateString(undefined, opts)
    return `${startLabel} – ${endLabel}`
}

const WeeklyTrendChart = () => {
    const [records, setRecords] = useState({
        employees: [],
        attendance: [],
        permissions: [],
        holidays: [],
    })
    const [weekOffset, setWeekOffset] = useState(0)
    const [status, setStatus] = useState('loading')
    // 0 = current week, 1 = one week ago, 2 = two weeks ago, etc.

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const [
                    employeeRes,
                    attendanceRes,
                    permissionRes,
                    holidayRes,
                ] = await Promise.all([
                    api.get(ENDPOINTS.EMPLOYEES),
                    api.get(ENDPOINTS.ATTENDANCE),
                    api.get(ENDPOINTS.PERMISSIONS),
                    api.get(ENDPOINTS.HOLIDAYS),
                ])

                if (cancelled) return

                const employees = employeeRes.data.filter(
                    (e) => e.role === "employee"
                )

                setRecords({
                    employees,
                    attendance: attendanceRes.data,
                    permissions: permissionRes.data,
                    holidays: holidayRes.data,
                })

                setStatus("ready")
            } catch (err) {
                if (!cancelled) setStatus("error")
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    // Shift the base week by weekOffset weeks so Prev/Next actually navigate
    const { weekStart, weekEnd } = useMemo(() => {
        const start = getStartOfCurrentWeek()
        start.setDate(start.getDate() - weekOffset * 7)

        const end = new Date(start)
        end.setDate(end.getDate() + 7)

        return { weekStart: start, weekEnd: end }
    }, [weekOffset])

    // ------------------------------------------------------------------
    // Attendance-status resolution — tied directly to your db.json shape:
    //
    //   holidays:    [{ date: "YYYY-MM-DD", ... }]
    //   permissions: [{ employeeId, date: "YYYY-MM-DD", status: "Approved" | "Rejected" | "Pending" }]
    //   attendance:  [{ employeeId, date: "YYYY-MM-DD", inTime, outTime, ... }]
    //
    // Note: some attendance records also carry their own `status` field
    // (e.g. EMP01 on 2026-07-27 has status: "Leave"). That field is NOT
    // used to decide Present/Leave — the RULES below are the single
    // source of truth. A row simply existing in `attendance` for that
    // employeeId + date means "they checked in", full stop.
    //
    // Priority order per employee, per day (first match wins):
    //   1. Holiday      -> every employee counted as Holiday, no per-employee checks
    //   2. Present       -> an attendance row exists for this employeeId + date
    //   3. Leave         -> no attendance row, but a permissions row exists
    //                       for this employeeId + date with status === "Approved"
    //   4. Absent        -> none of the above matched
    // ------------------------------------------------------------------

    const isHolidayDate = (date, holidays) =>
        holidays.some((h) => h.date === date)

    const hasAttendanceRecord = (employeeId, date, attendance) =>
        attendance.some((a) => a.employeeId === employeeId && a.date === date)

    const hasApprovedLeave = (employeeId, date, permissions) =>
        permissions.some(
            (p) =>
                p.employeeId === employeeId &&
                p.date === date &&
                p.status === "Approved"
        )

    // Resolves exactly one status per employee per day, in strict priority order.
    const resolveDailyStatus = (employeeId, date, { attendance, permissions }) => {
        if (hasAttendanceRecord(employeeId, date, attendance)) return "Present"
        if (hasApprovedLeave(employeeId, date, permissions)) return "Leave"
        return "Absent"
    }

    const data = useMemo(() => {
        const buckets = WEEKDAYS.map(day => ({
            day,
            Present: 0,
            Absent: 0,
            Leave: 0,
            Holiday: 0,
        }))

        const {
            employees,
            attendance,
            permissions,
            holidays,
        } = records

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (
            let d = new Date(weekStart);
            d < weekEnd;
            d.setDate(d.getDate() + 1)
        ) {
            const currentDate = new Date(d)
            currentDate.setHours(0, 0, 0, 0)

            // Skip only days strictly after today (so today itself is always included)
            if (currentDate > today) {
                continue
            }

            const date = toLocalISODate(currentDate)
            const weekday = currentDate.getDay()

            // Rule 1: Holiday overrides everything else for the whole company.
            if (isHolidayDate(date, holidays)) {
                buckets[weekday].Holiday += employees.length
                continue
            }

            // Rules 2-4: resolved per employee via resolveDailyStatus()
            employees.forEach((emp) => {
                const dailyStatus = resolveDailyStatus(emp.employeeId, date, {
                    attendance,
                    permissions,
                })
                buckets[weekday][dailyStatus]++
            })
        }

        return buckets
    }, [records, weekStart, weekEnd])

    const rangeLabel = useMemo(() => {
        const lastDayOfWeek = new Date(weekEnd)
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() - 1)
        return formatRange(weekStart, lastDayOfWeek)
    }, [weekStart, weekEnd])

    const goToPreviousWeek = () => setWeekOffset((prev) => prev + 1)
    const goToNextWeek = () => setWeekOffset((prev) => Math.max(0, prev - 1))
    const isCurrentWeek = weekOffset === 0

    if (status === 'loading') {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/40 bg-white/20 px-6 py-24 shadow-xl backdrop-blur-xl">
                <span className="text-sm text-slate-500">Loading trend…</span>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border border-white/40 bg-white/20 px-6 py-24 text-center shadow-xl backdrop-blur-xl">
                <span className="text-sm font-medium text-slate-700">
                    Couldn't load attendance trend
                </span>
                <span className="text-xs text-slate-500">
                    Check that the API is running and reachable at{' '}
                    {ENDPOINTS.ATTENDANCE}
                </span>
            </div>
        )
    }

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/20 px-6 py-6 shadow-xl backdrop-blur-xl">
            {/* subtle top sheen to sell the glass effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />

            <div className="relative flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Weekly Attendance Trend
                </span>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={goToPreviousWeek}
                        aria-label="Previous week"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/40 hover:text-slate-700"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <span className="min-w-[104px] text-center text-xs font-medium text-slate-600">
                        {isCurrentWeek ? 'This Week' : rangeLabel}
                    </span>
                    <button
                        type="button"
                        onClick={goToNextWeek}
                        disabled={isCurrentWeek}
                        aria-label="Next week"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/40 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* flex-1 fills leftover height after header + legend */}
            <div className="relative mt-4 min-h-0 flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="rgba(148, 163, 184, 0.3)"
                        />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12 }}
                        />
                        <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.15)' }}
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.55)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                borderRadius: 12,
                                fontSize: 12,
                                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                            }}
                            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                            itemStyle={{ color: '#334155' }}
                        />
                        {STATUS_CONFIG.map((s) => (
                            <Bar
                                key={s.key}
                                dataKey={s.key}
                                fill={s.color}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="relative mt-2 flex items-center justify-center gap-6">
                {STATUS_CONFIG.map((s) => (
                    <div key={s.key} className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                        />
                        <span className="text-xs text-slate-500">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WeeklyTrendChart