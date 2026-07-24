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
import api from '../../../API/Axios'
import ENDPOINTS from '../../../API/endpoints'

const STATUS_CONFIG = [
    { key: 'Present', label: 'Present', color: '#16a34a' },
    { key: 'Absent', label: 'Absent', color: '#ef4444' },
    { key: 'Leave', label: 'Leave', color: '#8b5cf6' },
]

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const WeeklyTrendChart = () => {
    const [records, setRecords] = useState([])
    const [status, setStatus] = useState('loading')

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.ATTENDANCE)
                if (cancelled) return
                setRecords(res.data)
                setStatus('ready')
            } catch (err) {
                if (!cancelled) setStatus('error')
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [])

    const data = useMemo(() => {
        const buckets = WEEKDAYS.map((day) => ({
            day,
            Present: 0,
            Absent: 0,
            Leave: 0,
        }))

        records.forEach((record) => {
            const jsDay = new Date(record.date).getDay()
            const index = jsDay === 0 ? 6 : jsDay - 1
            if (index < 0 || index > 5) return
            if (buckets[index][record.status] !== undefined) {
                buckets[index][record.status] += 1
            }
        })

        return buckets
    }, [records])

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

            <span className="relative text-xs font-semibold uppercase tracking-wider text-slate-500">
                Weekly Attendance Trend
            </span>

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