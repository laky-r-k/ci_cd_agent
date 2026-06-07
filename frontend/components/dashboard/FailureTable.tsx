'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  GitBranch,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Failure, FailureCategory, Severity, FailureStatus } from '@/types';
import CategoryBadge from './CategoryBadge';

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

function ConfidenceValue({ value }: { value: number }) {
  const color =
    value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-mono font-semibold ${color}`}>{value}%</span>;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const config: Record<Severity, string> = {
    LOW: 'bg-slate-700/50 text-slate-300 border-slate-600',
    MEDIUM: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
    HIGH: 'bg-orange-900/30 text-orange-300 border-orange-700/50',
    CRITICAL: 'bg-red-900/30 text-red-300 border-red-700/50',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config[severity]}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: FailureStatus }) {
  const config: Record<FailureStatus, string> = {
    PENDING: 'bg-slate-700/50 text-slate-300 border-slate-600',
    DIAGNOSED: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    OUTCOME_RECORDED: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
  };
  const labels: Record<FailureStatus, string> = {
    PENDING: 'Pending',
    DIAGNOSED: 'Diagnosed',
    OUTCOME_RECORDED: 'Recorded',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config[status]}`}>
      {labels[status]}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

type SortField = 'repository' | 'category' | 'confidence' | 'severity' | 'status' | 'timestamp';
type SortOrder = 'asc' | 'desc';

const CATEGORIES: FailureCategory[] = [
  'INFRASTRUCTURE_FAILURE',
  'DEPENDENCY_FAILURE',
  'TEST_FAILURE',
  'FLAKY_TEST',
  'BUILD_ERROR',
  'DEPLOYMENT_ERROR',
  'SECURITY_FAILURE',
  'CONFIGURATION_ISSUE',
];

const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES: FailureStatus[] = ['PENDING', 'DIAGNOSED', 'OUTCOME_RECORDED'];

interface FailureTableProps {
  failures: Failure[];
  isLoading: boolean;
  countdown: number;
}

export default function FailureTable({ failures, isLoading, countdown }: FailureTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FailureCategory | ''>('');
  const [severityFilter, setSeverityFilter] = useState<Severity | ''>('');
  const [statusFilter, setStatusFilter] = useState<FailureStatus | ''>('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    },
    [sortField]
  );

  const filtered = useMemo(() => {
    let result = [...failures];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.repository.toLowerCase().includes(q) ||
          f.branch.toLowerCase().includes(q) ||
          f.root_cause.toLowerCase().includes(q)
      );
    }

    // Filters
    if (categoryFilter) result = result.filter((f) => f.category === categoryFilter);
    if (severityFilter) result = result.filter((f) => f.severity === severityFilter);
    if (statusFilter) result = result.filter((f) => f.status === statusFilter);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'repository':
          cmp = a.repository.localeCompare(b.repository);
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category);
          break;
        case 'confidence':
          cmp = a.confidence - b.confidence;
          break;
        case 'severity': {
          const sevOrder = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
          cmp = sevOrder[a.severity] - sevOrder[b.severity];
          break;
        }
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'timestamp':
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [failures, search, categoryFilter, severityFilter, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-600" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ChevronDown className="w-3 h-3 text-cyan-400" />
    );
  };

  return (
    <div className="glass-card overflow-hidden hover:!transform-none animate-fade-in-up-delay-2">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search repos, branches..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
            />
          </div>

          {/* Filters */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value as FailureCategory | '');
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-muted focus:outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value as Severity | '');
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-muted focus:outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as FailureStatus | '');
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-muted focus:outline-none focus:border-accent/50 cursor-pointer hidden md:block"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh countdown */}
        <div className="flex items-center gap-2 text-xs text-text-muted bg-background px-3 py-1.5 rounded-full border border-border">
          <RefreshCw className={`w-3 h-3 ${countdown <= 3 ? 'animate-spin text-cyan-400' : ''}`} />
          Refreshing in {countdown}s
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-background/50">
              {[
                { field: 'repository' as SortField, label: 'Repository' },
                { field: null, label: 'Branch' },
                { field: 'category' as SortField, label: 'Category' },
                { field: 'confidence' as SortField, label: 'Conf.' },
                { field: 'severity' as SortField, label: 'Severity' },
                { field: 'status' as SortField, label: 'Status' },
                { field: 'timestamp' as SortField, label: 'Time' },
                { field: null, label: '' },
              ].map(({ field, label }, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider ${
                    field ? 'cursor-pointer hover:text-white select-none' : ''
                  }`}
                  onClick={() => field && handleSort(field)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="font-medium text-white">No failures detected</p>
                    <p className="text-sm">Your CI/CD pipelines are healthy</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((failure) => (
                <tr
                  key={failure.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-white truncate max-w-[180px] block">
                      {failure.repository}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                      <GitBranch className="w-3 h-3" />
                      {failure.branch}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={failure.category} />
                  </td>
                  <td className="px-4 py-3">
                    <ConfidenceValue value={failure.confidence} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={failure.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={failure.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {timeAgo(failure.timestamp)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/traces/${failure.id}`}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Trace
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{' '}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'hover:bg-white/5 text-text-muted'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-border hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
