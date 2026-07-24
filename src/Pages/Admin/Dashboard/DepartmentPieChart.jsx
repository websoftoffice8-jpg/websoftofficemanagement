import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Palmtree } from 'lucide-react'
import api from '../../../API/Axios'
import ENDPOINTS from '../../../API/endpoints'

const STATUS_CONFIG = [
    {
        key: 'Present',
        label: 'Present',
        color: '#10b981', // emerald-500
        soft: 'rgba(16, 185, 129, 0.12)',
        Icon: CheckCircle2,
    },
    {
        key: 'Absent',
        label: 'Absent',
        color: '#f43f5e', // rose-500
        soft: 'rgba(244, 63, 94, 0.12)',
        Icon: XCircle,
    },
    {
        key: 'Leave',
        label: 'on Leave',
        color: '#6366f1', // indigo-500
        soft: 'rgba(99, 102, 241, 0.12)',
        Icon: Palmtree,
    },
]

const RADIUS = 70
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
})

const DepartmentPieChart = () => {
    const [records, setRecords] = useState([])
    const [status, setStatus] = useState('loading')
    const [drawn, setDrawn] = useState(false)
    const [displayPct, setDisplayPct] = useState(0)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.ATTENDANCE)
                const data = res.data
                if (cancelled) return

                const latestDate = data.reduce(
                    (max, r) => (r.date > max ? r.date : max),
                    data[0]?.date ?? ''
                )
                setRecords(data.filter((r) => r.date === latestDate))
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

    useEffect(() => {
        if (status !== 'ready') return
        setDrawn(false)
        const raf = requestAnimationFrame(() => setDrawn(true))
        return () => cancelAnimationFrame(raf)
    }, [status, records])

    const { segments, total } = useMemo(() => {
        const counts = STATUS_CONFIG.map(({ key }) =>
            records.filter((r) => r.status === key).length
        )
        const total = counts.reduce((sum, c) => sum + c, 0) || 1

        let cumulative = 0
        const segments = STATUS_CONFIG.map((s, i) => {
            const count = counts[i]
            const fraction = count / total
            const dash = fraction * CIRCUMFERENCE
            const offset = -cumulative
            cumulative += dash
            return { ...s, count, fraction, dash, offset }
        })

        return { segments, total }
    }, [records])

    const presentCount = segments.find((s) => s.key === 'Present')?.count ?? 0
    const presentPct = Math.round(
        ((segments.find((s) => s.key === 'Present')?.fraction ?? 0) * 100)
    )

    useEffect(() => {
        if (status !== 'ready') return
        const start = performance.now()
        const from = 0
        const duration = 800
        let raf
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplayPct(Math.round(from + (presentPct - from) * eased))
            if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [status, presentPct])

    if (status === 'loading') {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/40 bg-white/20 px-6 py-20 shadow-xl backdrop-blur-xl">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/40 border-t-slate-500" />
                    <span className="text-sm text-slate-500">Loading attendance…</span>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl border border-white/40 bg-white/20 px-6 py-16 text-center shadow-xl backdrop-blur-xl">
                <span className="text-sm font-medium text-slate-700">
                    Couldn't load attendance data
                </span>
                <span className="text-xs text-slate-500">
                    Check that the API is running and reachable at{' '}
                    {ENDPOINTS.ATTENDANCE}
                </span>
            </div>
        )
    }

    return (
        // Glassmorphism: translucent white fill + backdrop-blur so whatever
        // is behind the card (gradient, image, other cards) shows through
        // softly. Border uses white/40 instead of solid slate for the
        // frosted-edge highlight look, and shadow is heavier to lift the
        // glass off the background.
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-white/20 shadow-xl backdrop-blur-xl">
            {/* subtle top sheen to sell the glass effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Attendance</h3>
                    <p className="text-xs text-slate-500">{TODAY_LABEL}</p>
                </div>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 backdrop-blur-sm">
                    {presentPct}% present
                </span>
            </div>

            {/* Donut ring */}
            <div className="relative flex flex-1 min-h-0 items-center justify-center py-2">
                <div className="relative">
                    <div
                        className="absolute inset-6 rounded-full opacity-50 blur-2xl"
                        style={{ backgroundColor: '#10b98140' }}
                    />
                    <svg
                        viewBox="0 0 180 180"
                        width="168"
                        height="168"
                        className="-rotate-90"
                    >
                        <circle
                            cx="90"
                            cy="90"
                            r={RADIUS}
                            fill="none"
                            stroke="rgba(148, 163, 184, 0.25)"
                            strokeWidth={STROKE}
                        />
                        {segments.map((s, i) => (
                            <circle
                                key={s.key}
                                cx="90"
                                cy="90"
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
                        <span className="text-3xl font-bold tabular-nums text-slate-800">
                            {displayPct}%
                        </span>
                        <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            {presentCount} of {total} present
                        </span>
                    </div>
                </div>
            </div>

            {/* Stat list */}
            <div className="relative divide-y divide-white/30 border-t border-white/30 px-6">
                {segments.map((s) => {
                    const Icon = s.Icon
                    const pct = Math.round(s.fraction * 100)
                    return (
                        <div key={s.key} className="flex items-center gap-3 py-2.5">
                            <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full backdrop-blur-sm"
                                style={{ backgroundColor: s.soft }}
                            >
                                <Icon size={14} strokeWidth={2.25} style={{ color: s.color }} />
                            </span>

                            <span className="text-sm font-medium text-slate-700">
                                {s.label}
                            </span>

                            <span className="mx-3 h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
                                <span
                                    className="block h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: drawn ? `${pct}%` : '0%',
                                        backgroundColor: s.color,
                                    }}
                                />
                            </span>

                            <span className="w-6 shrink-0 text-right text-sm font-semibold tabular-nums text-slate-800">
                                {s.count}
                            </span>
                        </div>
                    )
                })}
            </div>

            <div className="relative h-4" />
        </div>
    )
}

export default DepartmentPieChart