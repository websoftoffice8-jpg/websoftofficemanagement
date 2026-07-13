function SummaryCard({ label, value, accent = false }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-medium text-slate-500 mb-1.5">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-green-600" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}

export default function ReportHeader({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
      <SummaryCard label="Employees Tracked" value={summary.totalEmployees} />
      <SummaryCard
        label="Attendance Rate"
        value={`${summary.avgRate.toFixed(1)}%`}
        accent
      />
      <SummaryCard label="Total Present Days" value={summary.totalPresent} />
      <SummaryCard
        label="Avg Working Hours"
        value={`${summary.avgHours.toFixed(1)}h`}
      />
    </div>
  );
}