'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitBranch, GitCommit, Clock } from 'lucide-react';
import { Failure } from '@/types';
import { getFailure } from '@/lib/api';
import TraceDetails from '@/components/traces/TraceDetails';
import TracePanel from '@/components/traces/TracePanel';
import OutcomeForm from '@/components/traces/OutcomeForm';

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TraceExplorerPage() {
  const params = useParams();
  const id = params.id as string;
  const [failure, setFailure] = useState<Failure | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFailure(id);
        setFailure(data);
      } catch {
        console.error('Failed to load failure');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-64" />
          <div className="skeleton h-48" />
        </div>
      </div>
    );
  }

  if (!failure) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-text-muted">Failure not found</p>
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Repository header */}
      <div className="glass-card p-4 hover:!transform-none">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-mono font-semibold text-white">{failure.repository}</span>
          <span className="text-border">/</span>
          <span className="inline-flex items-center gap-1 text-slate-300">
            <GitBranch className="w-3.5 h-3.5" />
            {failure.branch}
          </span>
          <span className="text-border">/</span>
          <span className="inline-flex items-center gap-1 font-mono text-slate-400 text-xs">
            <GitCommit className="w-3.5 h-3.5" />
            {failure.commit_sha}
          </span>
          <span className="text-border">/</span>
          <span className="inline-flex items-center gap-1 text-text-muted text-xs">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo(failure.timestamp)}
          </span>
        </div>
      </div>

      {/* Diagnosis details */}
      <TraceDetails failure={failure} />

      {/* Trace accordion */}
      <TracePanel
        promptUsed={failure.prompt_used}
        agentResponse={failure.agent_response}
        toolCalls={failure.tool_calls}
      />

      {/* Outcome form */}
      <OutcomeForm failureId={failure.id} status={failure.status} />
    </div>
  );
}
