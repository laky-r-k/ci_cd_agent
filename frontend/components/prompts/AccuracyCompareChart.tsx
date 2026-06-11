'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { PromptVersion } from '@/types';

interface AccuracyCompareChartProps {
  prompts: PromptVersion[];
}

export default function AccuracyCompareChart({ prompts }: AccuracyCompareChartProps) {
  const chartData = [...prompts]
    .sort((a, b) => {
      const numA = parseInt(a.version.replace('V', ''));
      const numB = parseInt(b.version.replace('V', ''));
      return numA - numB;
    })
    .map((p) => ({
      version: p.version,
      accuracy: p.accuracy,
      status: p.status,
    }));

  const getColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#06B6D4';
      case 'PROPOSED':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-4">Accuracy Comparison</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="version"
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
              axisLine={{ stroke: '#1E293B' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
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
                    <p className="text-sm font-bold text-white">{d.version}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Accuracy: <span className="text-white font-mono font-bold">{d.accuracy}%</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      Status: <span className="text-white">{d.status}</span>
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              y={70}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: 'Threshold', fill: '#F59E0B', fontSize: 10, position: 'right' }}
            />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} barSize={50} animationDuration={800}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.status)} fillOpacity={0.85} />
              ))}
              <LabelList
                dataKey="accuracy"
                position="top"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: any) => `${v}%`) as any}
                style={{ fill: '#FFFFFF', fontSize: 13, fontWeight: 700 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-slate-500" />
          Archived
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-cyan-500" />
          Active
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          Proposed
        </div>
      </div>
    </div>
  );
}
