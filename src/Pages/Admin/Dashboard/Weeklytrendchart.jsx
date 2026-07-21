import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import ChartTooltip from "./ChartTooltip";
import { STATUS_STYLES } from "./utils";

const WeeklyTrendChart = ({ weeklyTrend }) => {
  return (
    <div className="dash-animate bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">
        Attendance This Week
      </h2>

      {weeklyTrend.length === 0 ? (
        <p className="text-sm text-slate-400 py-16 text-center">
          No attendance records yet.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={weeklyTrend}
            layout="vertical"
            barCategoryGap="28%"
          >
            <CartesianGrid horizontal={false} stroke="#f1f5f9" />

            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <YAxis
              type="category"
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              width={40}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "#f8fafc" }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate}
            />

            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-slate-500">{value}</span>
              )}
            />

            <Bar
              dataKey="Present"
              stackId="a"
              fill={STATUS_STYLES.Present.hex}
            />
            <Bar
              dataKey="Absent"
              stackId="a"
              fill={STATUS_STYLES.Absent.hex}
            />
           
            <Bar
              dataKey="Holiday"
              stackId="a"
              fill={STATUS_STYLES.Holiday.hex} 
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WeeklyTrendChart;