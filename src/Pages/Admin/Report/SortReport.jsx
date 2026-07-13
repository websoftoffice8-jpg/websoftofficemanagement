export default function ReportSort({
  search,
  setSearch,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  clearFilters,
}) {
  const hasActiveFilters = search || fromDate || toDate;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Search employee
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-3 text-xs font-medium text-slate-400 hover:text-green-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}