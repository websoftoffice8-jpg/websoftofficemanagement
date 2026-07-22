import React from 'react'

/**
 * Returns a time-of-day greeting ("Good morning" / "Good afternoon" / "Good evening").
 * Splits the day into three bands so the header feels alive without any extra state:
 *   00:00–11:59 -> morning
 *   12:00–16:59 -> afternoon
 *   17:00–23:59 -> evening
 */
export const getGreeting = (date = new Date()) => {
    const hour = date.getHours()

    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
}

/**
 * Formats a Date as "Wednesday, July 22, 2026".
 * Used for the full-date line under the page title.
 */
export const formatFullDate = (date = new Date()) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Formats a Date as a live clock string, e.g. "09:41:07 AM".
 * Used by the ticking status pill so the header reads as "live" data,
 * which fits an attendance dashboard where timing is the point.
 */
export const formatTime = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    })
}

/**
 * Turns a display name into 1-2 letter initials for an avatar badge.
 * "Admin" -> "AD", "Jane Doe" -> "JD"
 */
export const getInitials = (name = '') => {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
}

// Placeholder export so this file can still be dropped in and imported
// on its own without breaking anything, matching the original stub.
export const Utils = () => {
    return <div>Utils</div>
}