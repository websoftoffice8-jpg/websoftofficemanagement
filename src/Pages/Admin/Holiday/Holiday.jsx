import { useEffect, useState } from "react";
import api from "../../../API/Axios";
import ENDPOINTS from "../../../API/endpoints";

import HolidayForm from "./HolidayForm";
import HolidayTable from "./HolidayTable";
import {
    sortHolidaysByDate,
    holidayExists,
} from "./HolidayUtils";


export default function Holiday() {
    const [holidays, setHolidays] = useState([]);

    const [date, setDate] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const res = await api.get(ENDPOINTS.HOLIDAYS);

            const sorted = [...res.data].sort((a, b) =>
                a.date.localeCompare(b.date)
            );

            setHolidays(sortHolidaysByDate(res.data));
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setDate("");
        setTitle("");
        setDescription("");
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!date || !title.trim()) return;

        try {
            if (holidayExists(holidays, date, editingId)) {
                alert("A holiday already exists for this date.");
                return;
            }

            const payload = {
                date,
                title: title.trim(),
                description: description.trim(),
            };

            if (editingId) {
                await api.patch(
                    `${ENDPOINTS.HOLIDAYS}/${editingId}`,
                    payload
                );
            } else {
                await api.post(
                    ENDPOINTS.HOLIDAYS,
                    payload
                );
            }

            await fetchHolidays();
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (holiday) => {
        setEditingId(holiday.id);
        setDate(holiday.date);
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
                date={date}
                setDate={setDate}
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                editingId={editingId}
                handleSave={handleSave}
                resetForm={resetForm}
            />

            <HolidayTable
                holidays={holidays}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />
        </div>
    );
}