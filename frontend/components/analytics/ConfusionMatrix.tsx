'use client';

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

interface ConfusionMatrixProps {
  patterns: { from: FailureCategory; to: FailureCategory; count: number }[];
}

export default function ConfusionMatrix({ patterns }: ConfusionMatrixProps) {
  // Get unique categories from patterns
  const categories = Array.from(
    new Set([...patterns.map((p) => p.from), ...patterns.map((p) => p.to)])
  ).sort();

  if (categories.length === 0) {
    return (
      <div className="glass-card p-6 hover:!transform-none">
        <h3 className="text-sm font-semibold text-white mb-4">Confusion Matrix</h3>
        <p className="text-sm text-text-muted text-center py-8">
          Not enough data to generate confusion matrix
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...patterns.map((p) => p.count), 1);

  const getCount = (from: FailureCategory, to: FailureCategory): number => {
    const found = patterns.find((p) => p.from === from && p.to === to);
    return found?.count || 0;
  };

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-2">Confusion Matrix</h3>
      <p className="text-xs text-text-muted mb-4">
        Rows = Actual category, Columns = Predicted (misclassified as)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-xs text-text-muted font-medium px-2 py-2 text-left">Actual ↓</th>
              {categories.map((cat) => (
                <th
                  key={cat}
                  className="text-xs text-text-muted font-medium px-2 py-2 text-center"
                >
                  {CATEGORY_ABBR[cat]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((from) => (
              <tr key={from}>
                <td className="text-xs font-mono text-text-muted px-2 py-1.5">
                  {CATEGORY_ABBR[from]}
                </td>
                {categories.map((to) => {
                  const count = getCount(from, to);
                  const isDiagonal = from === to;
                  const intensity = count / maxCount;

                  let bgColor: string;
                  if (count === 0) {
                    bgColor = 'bg-slate-900/30';
                  } else if (isDiagonal) {
                    bgColor = `bg-emerald-500`;
                  } else {
                    bgColor = `bg-red-500`;
                  }

                  return (
                    <td key={to} className="px-1 py-1">
                      <div
                        className={`w-full h-10 rounded-md flex items-center justify-center text-xs font-mono font-medium transition-all ${bgColor}`}
                        style={{
                          opacity: count === 0 ? 0.3 : 0.2 + intensity * 0.8,
                        }}
                      >
                        {count > 0 && (
                          <span className="text-white font-bold">{count}</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500/50" />
          Correct (diagonal)
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/50" />
          Misclassified
        </div>
      </div>
    </div>
  );
}
