import { useEffect, useRef, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

import HolidayForm from "./HolidayForm";
import HolidayTable from "./HolidayTable";
import {
    sortHolidaysByDate,
    holidayExists,
} from "./HolidayUtils";

// How many months back/forward (relative to today) to auto-detect and
// backfill Saturdays as holidays. Adjust as needed.
const SATURDAY_LOOKBACK_MONTHS = 2;
const SATURDAY_LOOKAHEAD_MONTHS = 2;

const SATURDAY_TITLE = "Saturday";
const SATURDAY_DESCRIPTION = "Weekly off (auto-added)";

// Local YYYY-MM-DD string — avoids the UTC-shift bug you get from
// `date.toISOString().split('T')[0]` in timezones ahead of UTC.
const toLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// All dates (as local YYYY-MM-DD strings) between start and end, inclusive.
const getDatesInRange = (startStr, endStr) => {
    const dates = [];
    const cursor = new Date(`${startStr}T00:00:00`);
    const end = new Date(`${endStr}T00:00:00`);
    cursor.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (cursor <= end) {
        dates.push(toLocalDateString(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
};

// All Saturday dates (as local YYYY-MM-DD strings) between start and end, inclusive.
const getSaturdaysInRange = (start, end) => {
    const dates = [];
    const cursor = new Date(start);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= end) {
        if (cursor.getDay() === 6) {
            dates.push(toLocalDateString(cursor));
        }
        cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
};

export default function Holiday() {
    const [holidays, setHolidays] = useState([]);

    // Used as the "From" date, and as the single date when editing.
    const [fromDate, setFromDate] = useState("");
    // Only relevant when adding a new holiday (range). Ignored while editing.
    const [toDate, setToDate] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [editingId, setEditingId] = useState(null);

    // Guards so the auto-add routine only runs once per mount, not on
    // every holidays state update (fetchHolidays is called after every
    // save/delete too).
    const autoAddRanRef = useRef(false);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const res = await api.get(ENDPOINTS.HOLIDAYS);

            setHolidays(sortHolidaysByDate(res.data));

            // Run the Saturday auto-detect once, after the first successful load.
            if (!autoAddRanRef.current) {
                autoAddRanRef.current = true;
                await ensureSaturdayHolidays(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Detects Saturdays in the configured window that don't already have a
    // holiday entry, and creates them automatically.
    const ensureSaturdayHolidays = async (currentHolidays) => {
        try {
            const now = new Date();

            const start = new Date(
                now.getFullYear(),
                now.getMonth() - SATURDAY_LOOKBACK_MONTHS,
                1
            );

            const end = new Date(
                now.getFullYear(),
                now.getMonth() + SATURDAY_LOOKAHEAD_MONTHS + 1,
                0 // day 0 = last day of previous month => last day of the target month
            );

            const saturdays = getSaturdaysInRange(start, end);

            const missing = saturdays.filter(
                (sat) => !holidayExists(currentHolidays, sat, null)
            );

            if (missing.length === 0) return;

            await Promise.all(
                missing.map((sat) =>
                    api.post(ENDPOINTS.HOLIDAYS, {
                        date: sat,
                        title: SATURDAY_TITLE,
                        description: SATURDAY_DESCRIPTION,
                    })
                )
            );

            // Refresh the list so newly-added Saturdays show up in the table.
            const res = await api.get(ENDPOINTS.HOLIDAYS);
            setHolidays(sortHolidaysByDate(res.data));
        } catch (error) {
            console.error("Failed to auto-add Saturday holidays:", error);
        }
    };

    const resetForm = () => {
        setFromDate("");
        setToDate("");
        setTitle("");
        setDescription("");
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!fromDate || !title.trim()) return;

        try {
            // Editing an existing holiday: single date, same as before.
            if (editingId) {
                if (holidayExists(holidays, fromDate, editingId)) {
                    alert("A holiday already exists for this date.");
                    return;
                }

                await api.patch(`${ENDPOINTS.HOLIDAYS}/${editingId}`, {
                    date: fromDate,
                    title: title.trim(),
                    description: description.trim(),
                });

                await fetchHolidays();
                resetForm();
                return;
            }

            // Creating new: a range of one or more days.
            if (!toDate) return;

            if (toDate < fromDate) {
                alert('"To Date" cannot be before "From Date".');
                return;
            }

            const range = getDatesInRange(fromDate, toDate);

            const toCreate = range.filter(
                (d) => !holidayExists(holidays, d, null)
            );
            const skipped = range.length - toCreate.length;

            if (toCreate.length === 0) {
                alert("A holiday already exists for every date in that range.");
                return;
            }

            await Promise.all(
                toCreate.map((d) =>
                    api.post(ENDPOINTS.HOLIDAYS, {
                        date: d,
                        title: title.trim(),
                        description: description.trim(),
                    })
                )
            );

            await fetchHolidays();
            resetForm();

            if (skipped > 0) {
                alert(
                    `Added ${toCreate.length} day(s). Skipped ${skipped} date(s) that already had a holiday.`
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (holiday) => {
        setEditingId(holiday.id);
        setFromDate(holiday.date);
        setToDate(""); // not used while editing
        setTitle(holiday.title);
        setDescription(holiday.description || "");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Delete this holiday?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`${ENDPOINTS.HOLIDAYS}/${id}`);

            await fetchHolidays();

            if (editingId === id) {
                resetForm();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-1">
                Holidays
            </h1>

            <p className="text-slate-500 text-sm mb-8">
                Manage company holidays.
            </p>

            <HolidayForm
                fromDate={fromDate}
                setFromDate={setFromDate}
                toDate={toDate}
                setToDate={setToDate}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                editingId={editingId}
                handleSave={handleSave}
                resetForm={resetForm}
            />

            <HolidayTable
                holidays={holidays.filter(
                    (holiday) => holiday.title !== SATURDAY_TITLE
                )}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />
        </div>
    );
}