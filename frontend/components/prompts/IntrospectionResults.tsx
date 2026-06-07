'use client';

import { ArrowRight } from 'lucide-react';
import { IntrospectionResult } from '@/types';
import CategoryBadge from '@/components/dashboard/CategoryBadge';

interface IntrospectionResultsProps {
  data: IntrospectionResult;
}

export default function IntrospectionResults({ data }: IntrospectionResultsProps) {
  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
        <span className="text-base">🔬</span>
        Introspection Results
      </h3>

      <div className="space-y-6">
        {/* Weak Categories */}
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
            Weak Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.weak_categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} size="md" />
            ))}
          </div>
        </div>

        {/* Misclassification Patterns */}
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
            Misclassification Patterns
          </h4>
          <div className="space-y-2">
            {data.misclassification_patterns.map((pattern, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-red-950/10 border border-red-900/20"
              >
                <CategoryBadge category={pattern.from} size="sm" />
                <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                <CategoryBadge category={pattern.to} size="sm" />
                <span className="ml-auto text-sm font-bold text-red-300 font-mono">
                  {pattern.count}×
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Improvements */}
        <div>
          <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
            Suggested Improvements
          </h4>
          <div className="space-y-2">
            {data.suggested_improvements.map((improvement, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-cyan-950/10 border border-cyan-900/20"
              >
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
