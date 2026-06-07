'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
} from 'recharts';
import { TrendPoint } from '@/types';

interface TrendLineChartProps {
  data: TrendPoint[];
}

export default function TrendLineChart({ data }: TrendLineChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-4">30-Day Accuracy Trend</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              axisLine={{ stroke: '#1E293B' }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
                    <p className="text-sm font-medium text-white">{d.dateLabel}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Accuracy: <span className="text-cyan-400 font-mono font-bold">{d.accuracy}%</span>
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              fill="url(#accuracyGradient)"
              stroke="none"
              animationDuration={1200}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#06B6D4"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#06B6D4', strokeWidth: 2, stroke: '#020617' }}
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
