import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Clock3 } from 'lucide-react'

// In your app, these would come from `./Utils` — inlined here so this
// component renders standalone.
const getGreeting = (date = new Date()) => {
    const hour = date.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

const formatFullDate = (date = new Date()) =>
    date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

const formatTime = (date = new Date()) =>
    date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    })

const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')

const ADMIN_NAME = 'Admin'

const DashboardHeader = () => {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mb-8">
            {/* Thin gradient rule — the one accent, reads as a subtle progress/tracking cue */}
            <div className="h-1 w-full bg-gradient-to-r from-green-600 via-green-500 to-green-400" />

            <div className="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                {/* Left: identity + greeting */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-green-50">
                            <LayoutDashboard className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Dashboard
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {getGreeting(now)}, {ADMIN_NAME}
                    </h1>
                    <p className="text-sm text-slate-500">
                        Here's an overview of today's attendance.
                    </p>
                </div>

                {/* Right: live date/time + avatar */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
                        <Clock3 className="h-4 w-4 text-slate-400" strokeWidth={2} />
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                {formatTime(now)}
                            </span>
                            <span className="text-xs text-slate-500">
                                {formatFullDate(now)}
                            </span>
                        </div>
                    </div>

                    {/* <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white ring-2 ring-white shadow-sm">
                            {getInitials(ADMIN_NAME)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default DashboardHeader