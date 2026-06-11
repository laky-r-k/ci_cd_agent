'use client';

import { useFailures } from '@/hooks/useFailures';
import StatsCards from '@/components/dashboard/StatsCards';
import FailureTable from '@/components/dashboard/FailureTable';

export default function DashboardPage() {
  const { failures, isLoading, countdown } = useFailures();

  const failuresToday = failures.filter((f) => {
    const today = new Date();
    const ts = new Date(f.timestamp);
    return ts.toDateString() === today.toDateString();
  }).length;

  const failuresWeek = failures.length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Failure Monitor</h1>
            <p className="text-sm text-text-muted mt-1">
              Real-time CI/CD failure detection and AI diagnosis
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="flex items-center gap-2 text-xs text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Monitoring
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up-delay-1">
        <StatsCards
          failuresToday={failuresToday}
          failuresWeek={failuresWeek}
          accuracy={78}
          activePrompt="V2"
        />
      </div>

      {/* Table */}
      <FailureTable failures={failures} isLoading={isLoading} countdown={countdown} />
    </div>
  );
}
