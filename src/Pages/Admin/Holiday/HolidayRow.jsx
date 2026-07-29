import React from 'react'
import { formatHolidayDate } from "./HolidayUtils";



import { Pencil, Trash2 } from "lucide-react";

export default function HolidayRow({
    holiday,
    handleEdit,
    handleDelete,
}) {
    const isRange = holiday.endDate && holiday.endDate !== holiday.date;

    const formattedDate = isRange
        ? `${formatHolidayDate(holiday.date)} – ${formatHolidayDate(holiday.endDate)}`
        : formatHolidayDate(holiday.date);

    const idsToDelete = holiday.ids || [holiday.id];

    return (
        <tr className="hover:bg-slate-50 transition-colors">
            <td className="px-5 py-4 text-sm text-slate-700 whitespace-nowrap">
                {formattedDate}
                {isRange && (
                    <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                        {idsToDelete.length} days
                    </span>
                )}
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
                        onClick={() => !isRange && handleEdit(holiday)}
                        disabled={isRange}
                        className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        title={isRange ? "Editing isn't available for multi-day ranges" : "Edit Holiday"}
                    >
                        <Pencil size={16} />
                    </button>

                    <button
                        onClick={() => handleDelete(idsToDelete)}
                        className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        title={isRange ? "Delete entire range" : "Delete Holiday"}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
}