'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CorrectnessPieChartProps {
  correct: number;
  incorrect: number;
}

export default function CorrectnessPieChart({ correct, incorrect }: CorrectnessPieChartProps) {
  const total = correct + incorrect;
  const data = [
    { name: 'Correct', value: correct, color: '#10B981' },
    { name: 'Incorrect', value: incorrect, color: '#EF4444' },
  ];

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-4">Correct vs Incorrect</h3>
      <div className="h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              animationBegin={200}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
                    <p className="text-sm font-medium text-white">{d.name}</p>
                    <p className="text-xs text-text-muted">
                      Count: <span className="text-white font-mono">{d.value}</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      Percentage:{' '}
                      <span className="text-white font-mono">
                        {Math.round((d.value / total) * 100)}%
                      </span>
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-text-muted">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs text-text-muted">
            Correct ({Math.round((correct / total) * 100)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-text-muted">
            Incorrect ({Math.round((incorrect / total) * 100)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
