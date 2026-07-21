// src/components/dashboard/sections/AttendanceDonutChart.jsx
// "Today's Distribution" donut. Owns its own hover state (activeSlice)
// since that interaction is local to this chart and shouldn't touch
// Dashboard.jsx's state at all.

import { useState } from "react";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ChartTooltip from "./ChartTooltip";

// Custom active shape: lifts the hovered slice, adds a soft inner ring,
// and prints its own value/label in the exact center so the number is
// never off-register with the arc.
const renderActiveDonutShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 9}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={Math.max(0, innerRadius - 6)}
        outerRadius={innerRadius - 1}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.25}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 24, fontWeight: 700, fill: "#1e293b" }}>
        {value}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" style={{ fontSize: 11, fill: "#94a3b8" }}>
        {payload.name} · {Math.round(percent * 100)}%
      </text>
    </g>
  );
};

const AttendanceDonutChart = ({ pieData, rate, marked }) => {
  const [activeSlice, setActiveSlice] = useState(null);

  return (
    <div className="dash-animate bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
      <h2 className="text-sm font-semibold text-slate-800 mb-2">
        Today's Distribution
      </h2>

      {marked === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">
          No attendance marked for this day.
        </p>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <defs>
                <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.12" />
                </filter>
              </defs>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={pieData.length > 1 ? 3 : 0}
                cornerRadius={4}
                startAngle={90}
                endAngle={-270}
                animationDuration={700}
                filter="url(#donutShadow)"
                activeIndex={activeSlice}
                activeShape={renderActiveDonutShape}
                onMouseEnter={(_, index) => setActiveSlice(index)}
                onMouseLeave={() => setActiveSlice(null)}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value, entry) => (
                  <span className="text-xs text-slate-500">
                    {value}
                    <span className="text-slate-400"> · {entry.payload.value}</span>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Default center label — hidden while a slice is hovered,
              since the active shape draws its own centered label. */}
          {activeSlice === null && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ paddingBottom: 44 }}
            >
              <span className="text-[26px] font-bold text-slate-800 tabular-nums leading-none">
                {rate}%
              </span>
              <span className="text-[11px] text-slate-400 uppercase tracking-wide mt-1.5">
                Present
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceDonutChart;