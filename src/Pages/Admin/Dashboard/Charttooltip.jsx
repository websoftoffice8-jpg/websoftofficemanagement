// src/components/dashboard/sections/ChartTooltip.jsx
// Shared tooltip styling so the donut chart and bar chart match the rest
// of the UI instead of Recharts' default look.

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3.5 py-2.5 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1.5">{label}</p>}
      <div className="space-y-1">
        {payload
          .filter((p) => p.value > 0)
          .map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: p.color || p.payload?.color }}
              />
              <span className="text-slate-500">{p.name}</span>
              <span className="font-semibold text-slate-800 ml-auto tabular-nums">
                {p.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ChartTooltip;