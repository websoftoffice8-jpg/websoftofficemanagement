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

const toLocalDateString = (d) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const formatRange = (start, end) => {
    const opts = { month: 'short', day: 'numeric' }
    const startLabel = start.toLocaleDateString(undefined, opts)
    const endLabel = end.toLocaleDateString(undefined, opts)
    return `${startLabel} – ${endLabel}`
}

const WeeklyTrendChart = () => {
    const [employees, setEmployees] = useState([])
    const [attendance, setAttendance] = useState([])
    const [permissions, setPermissions] = useState([])
    const [holidays, setHolidays] = useState([])
    const [status, setStatus] = useState('loading')
    // 0 = current week, 1 = one week ago, 2 = two weeks ago, etc.
    const [weekOffset, setWeekOffset] = useState(0)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const [
                    employeesRes,
                    attendanceRes,
                    permissionsRes,
                    holidaysRes,
                ] = await Promise.all([
                    api.get(ENDPOINTS.EMPLOYEES),
                    api.get(ENDPOINTS.ATTENDANCE),
                    api.get(ENDPOINTS.PERMISSIONS),
                    api.get(ENDPOINTS.HOLIDAYS),
                ])

                if (cancelled) return

                setEmployees(
                    employeesRes.data.filter((u) => u.role === "employee")
                )

                setAttendance(attendanceRes.data)
                setPermissions(permissionsRes.data)
                setHolidays(holidaysRes.data)

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

    const { weekStart, weekEnd } = useMemo(() => {
        const start = getStartOfCurrentWeek()
        start.setDate(start.getDate() - weekOffset * 7)
        const end = new Date(start)
        end.setDate(end.getDate() + 7) // exclusive upper bound (next Sunday)
        return { weekStart: start, weekEnd: end }
    }, [weekOffset])

    const data = useMemo(() => {
        const buckets = WEEKDAYS.map((day) => ({
            day,
            Present: 0,
            Absent: 0,
            Leave: 0,
        }))

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (
            let current = new Date(weekStart);
            current < weekEnd;
            current.setDate(current.getDate() + 1)
        ) {
            const currentDate = new Date(current)
            currentDate.setHours(0, 0, 0, 0)

            // Skip future dates
            if (currentDate > today) {
                continue
            }

            const date = toLocalDateString(current)
            const dayIndex = current.getDay()

            const holiday = holidays.find((h) => h.date === date)

            employees.forEach((employee) => {
                // Holiday (skip counting absent/present/leave)
                if (holiday) {
                    return
                }

                const permission = permissions.find(
                    (p) =>
                        p.employeeId === employee.employeeId &&
                        p.date === date &&
                        p.status === "Approved"
                )

                if (permission) {
                    buckets[dayIndex].Leave++
                    return
                }

                const log = attendance.find(
                    (a) =>
                        a.employeeId === employee.employeeId &&
                        a.date === date
                )

                if (log?.status === "Leave") {
                    buckets[dayIndex].Leave++
                } else if (log?.inTime) {
                    buckets[dayIndex].Present++
                } else {
                    buckets[dayIndex].Absent++
                }
            })
        }

        return buckets
    }, [
        employees,
        attendance,
        permissions,
        holidays,
        weekStart,
        weekEnd,
    ])

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
        // Glassmorphism: translucent white fill + backdrop-blur, matching
        // DepartmentPieChart. h-full + flex-col still fills whatever height
        // the grid's default "align-items: stretch" gives this cell.
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