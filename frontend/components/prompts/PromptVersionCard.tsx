'use client';

import { PromptVersion } from '@/types';

interface PromptVersionCardProps {
  prompt: PromptVersion;
  isLast?: boolean;
}

export default function PromptVersionCard({ prompt, isLast = false }: PromptVersionCardProps) {
  const statusColors = {
    ACTIVE: {
      dot: 'bg-emerald-400',
      ring: 'ring-emerald-400/30',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      border: 'border-cyan-500/30',
      glow: true,
    },
    ARCHIVED: {
      dot: 'bg-slate-500',
      ring: 'ring-slate-500/20',
      badge: 'bg-slate-700/50 text-slate-400 border-slate-600/50',
      border: 'border-border',
      glow: false,
    },
    PROPOSED: {
      dot: 'bg-blue-400',
      ring: 'ring-blue-400/30',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      border: 'border-blue-500/20',
      glow: false,
    },
  };

  const colors = statusColors[prompt.status];
  const date = new Date(prompt.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full ${colors.dot} ring-4 ${colors.ring} flex-shrink-0 ${
            prompt.status === 'ACTIVE' ? 'animate-pulse-ring' : ''
          }`}
        />
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      {/* Card */}
      <div
        className={`flex-1 glass-card p-4 mb-4 hover:!transform-none border ${colors.border} ${
          colors.glow ? 'glow-accent' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{prompt.version}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}
            >
              {prompt.status}
            </span>
          </div>
          <span className="text-xs text-text-muted">{date}</span>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div>
            <span className="text-2xl font-bold text-white">{prompt.accuracy}%</span>
            <span className="text-xs text-text-muted ml-1">accuracy</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div>
            <span className="text-sm font-medium text-text-muted">
              {prompt.diagnosis_count} diagnoses
            </span>
          </div>
        </div>

        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full progress-animated ${
              prompt.status === 'ACTIVE'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500'
                : prompt.status === 'PROPOSED'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                : 'bg-slate-600'
            }`}
            style={{ width: `${prompt.accuracy}%` }}
          />
        </div>
      </div>
    </div>
  );
}
