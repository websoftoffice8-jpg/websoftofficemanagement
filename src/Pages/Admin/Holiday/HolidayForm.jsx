export default function HolidayForm({
  date,
  setDate,
  title,
  setTitle,
  description,
  setDescription,
  editingId,
  handleSave,
  resetForm,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Holiday Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Holiday Name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Holiday Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Dashain"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Save Button */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1 invisible">
            Save
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!date || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700"
            >
              {editingId ? "Update Holiday" : "Add Holiday"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-5">
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Description (Optional)
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="e.g. National Festival, Office Closed"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
        />
      </div>
    </div>
  );
}