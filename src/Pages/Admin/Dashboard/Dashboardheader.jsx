import React from 'react'

const DashboardHeader = () => {
    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    return (
        <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
                Dashboard
            </h1>

            <p className="text-sm text-slate-500">
                {today}
            </p>

            <p className="text-slate-600 mt-2">
                Welcome back, <span className="font-semibold">Admin</span>.
                Here's an overview of today's attendance.
            </p>
        </div>
    )
}

export default DashboardHeader
