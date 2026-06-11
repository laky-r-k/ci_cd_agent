'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import AccuracyHero from '@/components/analytics/AccuracyHero';
import CategoryBarChart from '@/components/analytics/CategoryBarChart';
import TrendLineChart from '@/components/analytics/TrendLineChart';
import CorrectnessPieChart from '@/components/analytics/CorrectnessPieChart';
import WeakSpotCard from '@/components/analytics/WeakSpotCard';
import ConfusionMatrix from '@/components/analytics/ConfusionMatrix';
import { Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock confusion data derived from weak spots
const MOCK_CONFUSION = [
  { from: 'FLAKY_TEST' as const, to: 'TEST_FAILURE' as const, count: 12 },
  { from: 'CONFIGURATION_ISSUE' as const, to: 'INFRASTRUCTURE_FAILURE' as const, count: 7 },
  { from: 'DEPENDENCY_FAILURE' as const, to: 'BUILD_ERROR' as const, count: 4 },
  { from: 'INFRASTRUCTURE_FAILURE' as const, to: 'DEPLOYMENT_ERROR' as const, count: 3 },
];

export default function AnalyticsPage() {
  const { accuracy, trends, isLoading, runEval, isEvaluating } = useAnalytics();

  const handleRunEval = async () => {
    try {
      await runEval();
      toast.success('Evaluation complete. 200 diagnoses evaluated.');
    } catch {
      toast.error('Evaluation failed');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-72" />
          <div className="skeleton h-72" />
        </div>
      </div>
    );
  }

  if (!accuracy) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-white">Learning Analytics</h1>
          <p className="text-sm text-text-muted mt-1">
            Track AI diagnostic accuracy and identify improvement areas
          </p>
        </div>
        <button
          onClick={handleRunEval}
          disabled={isEvaluating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Evaluation
            </>
          )}
        </button>
      </div>

      {/* Hero */}
      <div className="animate-fade-in-up-delay-1">
        <AccuracyHero
          accuracy={accuracy.overall_accuracy}
          total={accuracy.total_diagnoses}
          correct={accuracy.correct_diagnoses}
          incorrect={accuracy.incorrect_diagnoses}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up-delay-2">
        <CategoryBarChart data={accuracy.accuracy_by_category} />
        <TrendLineChart data={trends} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up-delay-3">
        <WeakSpotCard spots={accuracy.weak_spots} />
        <CorrectnessPieChart
          correct={accuracy.correct_diagnoses}
          incorrect={accuracy.incorrect_diagnoses}
        />
      </div>

      {/* Confusion Matrix */}
      <div className="animate-fade-in-up-delay-4">
        <ConfusionMatrix patterns={MOCK_CONFUSION} />
      </div>
    </div>
  );
}
