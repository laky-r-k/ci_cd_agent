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
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { FailureCategory } from '@/types';

const CATEGORY_ABBR: Record<FailureCategory, string> = {
  INFRASTRUCTURE_FAILURE: 'INFRA',
  DEPENDENCY_FAILURE: 'DEP',
  TEST_FAILURE: 'TEST',
  FLAKY_TEST: 'FLAKY',
  BUILD_ERROR: 'BUILD',
  DEPLOYMENT_ERROR: 'DEPLOY',
  SECURITY_FAILURE: 'SEC',
  CONFIGURATION_ISSUE: 'CONFIG',
};

interface CategoryBarChartProps {
  data: { category: FailureCategory; accuracy: number; count: number }[];
}

export default function CategoryBarChart({ data }: CategoryBarChartProps) {
  const chartData = data
    .map((d) => ({
      ...d,
      name: CATEGORY_ABBR[d.category],
      fullName: d.category.replace(/_/g, ' '),
      isWeak: d.accuracy < 70,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-4">Accuracy by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#1E293B' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={55}
              tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface border border-border rounded-lg p-3 shadow-xl">
                    <p className="text-sm font-medium text-white">{d.fullName}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Accuracy: <span className="text-white font-mono">{d.accuracy}%</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      Count: <span className="text-white font-mono">{d.count}</span>
                    </p>
                    {d.isWeak && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                        <AlertTriangle className="w-3 h-3" />
                        Below threshold
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <ReferenceLine
              x={70}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: '70%', fill: '#F59E0B', fontSize: 10, position: 'top' }}
            />
            <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20} animationDuration={800}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isWeak ? '#EF4444' : entry.accuracy >= 85 ? '#10B981' : '#06B6D4'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
