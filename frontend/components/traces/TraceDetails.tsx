'use client';

import { Failure } from '@/types';
import CategoryBadge from '@/components/dashboard/CategoryBadge';
import ConfidenceMeter from './ConfidenceMeter';
import { Clock, Cpu, FileText, ExternalLink, Tag } from 'lucide-react';

interface TraceDetailsProps {
  failure: Failure;
}

export default function TraceDetails({ failure }: TraceDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main diagnosis */}
      <div className="lg:col-span-2 glass-card p-6 hover:!transform-none">
        <div className="mb-4">
          <CategoryBadge category={failure.category} size="lg" />
        </div>

        <ConfidenceMeter value={failure.confidence} />

        <div className="mt-6 space-y-5">
          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
              <span className="text-base">🔍</span> Root Cause
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{failure.root_cause}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Affected Files
            </h4>
            <div className="space-y-1">
              {failure.affected_files.map((file, i) => (
                <div
                  key={i}
                  className="font-mono text-xs text-cyan-300 bg-cyan-500/5 border border-cyan-500/10 rounded-md px-3 py-1.5"
                >
                  {file}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
              <span className="text-base">💡</span> Recommended Fix
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">{failure.recommended_fix}</p>
          </div>
        </div>
      </div>

      {/* Trace info sidebar */}
      <div className="glass-card p-6 hover:!transform-none h-fit">
        <h3 className="text-sm font-semibold text-white mb-4">Trace Info</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted flex items-center gap-2">
              <Clock className="w-4 h-4" /> Latency
            </span>
            <span className="text-sm font-mono text-white">
              {failure.latency_ms ? `${(failure.latency_ms / 1000).toFixed(1)}s` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Tokens
            </span>
            <span className="text-sm font-mono text-white">
              {failure.token_usage ? failure.token_usage.total.toLocaleString() : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted flex items-center gap-2">
              <Tag className="w-4 h-4" /> Prompt
            </span>
            <span className="text-sm font-medium text-cyan-400">{failure.prompt_version}</span>
          </div>

          {failure.token_usage && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-text-muted mb-2">Token Breakdown</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Input</span>
                  <span className="font-mono text-slate-300">
                    {failure.token_usage.input.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Output</span>
                  <span className="font-mono text-slate-300">
                    {failure.token_usage.output.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {failure.phoenix_trace_url && (
            <a
              href={failure.phoenix_trace_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors pt-3 border-t border-border/50"
            >
              <ExternalLink className="w-4 h-4" />
              View in Phoenix
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
