'use client';

import { AlertTriangle } from 'lucide-react';
import { FailureCategory } from '@/types';

interface WeakSpotCardProps {
  spots: { category: FailureCategory; accuracy: number }[];
}

export default function WeakSpotCard({ spots }: WeakSpotCardProps) {
  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        Weak Spots
      </h3>
      <div className="space-y-4">
        {spots.map((spot) => {
          const gap = 70 - spot.accuracy;
          return (
            <div
              key={spot.category}
              className="p-4 rounded-xl border border-red-800/30 bg-red-950/20"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-red-300">
                    {spot.category.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xs text-red-400/70 mt-0.5">
                    Below 70% threshold {gap > 0 ? `(${gap}% gap)` : ''}
                  </p>
                </div>
                <span className="text-2xl font-bold text-red-400">{spot.accuracy}%</span>
              </div>
              <div className="h-2 bg-red-950/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full progress-animated"
                  style={{ width: `${spot.accuracy}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-red-500/50">0%</span>
                <span className="text-[10px] text-yellow-500/50">70% threshold</span>
                <span className="text-[10px] text-red-500/50">100%</span>
              </div>
            </div>
          );
        })}
        {spots.length === 0 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-text-muted">All categories above threshold</p>
          </div>
        )}
      </div>
    </div>
  );
}
