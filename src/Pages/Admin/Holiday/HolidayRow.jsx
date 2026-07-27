import React from 'react'
import { formatHolidayDate } from "./HolidayUtils";



import { Pencil, Trash2 } from "lucide-react";

export default function HolidayRow({
    holiday,
    handleEdit,
    handleDelete,
}) {
    const formattedDate = formatHolidayDate(holiday.date);

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                {formattedDate}
            </td>

            <td className="px-5 py-4">
                <span className="font-medium text-slate-800">
                    {holiday.title}
                </span>
            </td>

            <td className="px-5 py-4 text-sm text-slate-600">
                {holiday.description || (
                    <span className="italic text-slate-400">
                        No description
                    </span>
                )}
            </td>

            <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => handleEdit(holiday)}
                        className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
                        title="Edit Holiday"
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => handleDelete(holiday.id)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete Holiday"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}