'use client';

import { useEffect, useState } from 'react';

interface ConfidenceMeterProps {
  value: number;
}

export default function ConfidenceMeter({ value }: ConfidenceMeterProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const color =
    value >= 80
      ? 'from-emerald-500 to-emerald-400'
      : value >= 60
      ? 'from-yellow-500 to-yellow-400'
      : 'from-red-500 to-red-400';

  const bgColor =
    value >= 80 ? 'bg-emerald-500/10' : value >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10';

  const textColor =
    value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">Confidence</span>
        <span className={`text-lg font-bold ${textColor}`}>{value}%</span>
      </div>
      <div className={`h-3 rounded-full overflow-hidden ${bgColor}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-[600ms] ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
