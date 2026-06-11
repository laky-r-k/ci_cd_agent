'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsAccuracy, TrendPoint } from '@/types';
import { getAccuracy, getTrends, runEvaluation } from '@/lib/api';

export function useAnalytics() {
  const [accuracy, setAccuracy] = useState<AnalyticsAccuracy | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [acc, trd] = await Promise.all([getAccuracy(), getTrends()]);
      setAccuracy(acc);
      setTrends(trd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runEval = useCallback(async () => {
    setIsEvaluating(true);
    try {
      await runEvaluation();
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { accuracy, trends, isLoading, error, runEval, isEvaluating };
}
