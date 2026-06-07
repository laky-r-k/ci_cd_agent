'use client';

import { FailureCategory } from '@/types';

const categoryConfig: Record<
  FailureCategory,
  { abbr: string; bg: string; text: string; border: string; dot: string }
> = {
  INFRASTRUCTURE_FAILURE: {
    abbr: 'INFRA',
    bg: 'bg-red-900/40',
    text: 'text-red-300',
    border: 'border-red-700/50',
    dot: 'bg-red-400',
  },
  DEPENDENCY_FAILURE: {
    abbr: 'DEP',
    bg: 'bg-orange-900/40',
    text: 'text-orange-300',
    border: 'border-orange-700/50',
    dot: 'bg-orange-400',
  },
  TEST_FAILURE: {
    abbr: 'TEST',
    bg: 'bg-blue-900/40',
    text: 'text-blue-300',
    border: 'border-blue-700/50',
    dot: 'bg-blue-400',
  },
  FLAKY_TEST: {
    abbr: 'FLAKY',
    bg: 'bg-purple-900/40',
    text: 'text-purple-300',
    border: 'border-purple-700/50',
    dot: 'bg-purple-400',
  },
  BUILD_ERROR: {
    abbr: 'BUILD',
    bg: 'bg-yellow-900/40',
    text: 'text-yellow-300',
    border: 'border-yellow-700/50',
    dot: 'bg-yellow-400',
  },
  DEPLOYMENT_ERROR: {
    abbr: 'DEPLOY',
    bg: 'bg-cyan-900/40',
    text: 'text-cyan-300',
    border: 'border-cyan-700/50',
    dot: 'bg-cyan-400',
  },
  SECURITY_FAILURE: {
    abbr: 'SEC',
    bg: 'bg-pink-900/40',
    text: 'text-pink-300',
    border: 'border-pink-700/50',
    dot: 'bg-pink-400',
  },
  CONFIGURATION_ISSUE: {
    abbr: 'CONFIG',
    bg: 'bg-green-900/40',
    text: 'text-green-300',
    border: 'border-green-700/50',
    dot: 'bg-green-400',
  },
};

interface CategoryBadgeProps {
  category: FailureCategory;
  size?: 'sm' | 'md' | 'lg';
}

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <div className="relative group inline-block">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.abbr}
      </span>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-border">
        {category.replace(/_/g, ' ')}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );
}

export { categoryConfig };
