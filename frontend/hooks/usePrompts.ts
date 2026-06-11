'use client';

import { useState, useEffect, useCallback } from 'react';
import { PromptVersion, ImprovePromptResponse } from '@/types';
import { getPrompts, improvePrompt, deployPrompt } from '@/lib/api';

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [improveResult, setImproveResult] = useState<ImprovePromptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState(0);

  const activePrompt = prompts.find((p) => p.is_active) || null;

  const fetchPrompts = useCallback(async () => {
    try {
      setError(null);
      const data = await getPrompts();
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setGenerationStep(0);
    setImproveResult(null);
    try {
      // Simulate multi-step progress
      const stepDurations = [1500, 1500, 2000, 500];
      for (let i = 0; i < stepDurations.length - 1; i++) {
        setGenerationStep(i + 1);
        await new Promise((r) => setTimeout(r, stepDurations[i]));
      }
      const result = await improvePrompt();
      setGenerationStep(4);
      setImproveResult(result);
      // Add the proposed prompt to prompts list if not already there
      setPrompts((prev) => {
        const exists = prev.some((p) => p.version === result.proposed_prompt.version);
        if (exists) return prev;
        return [...prev, result.proposed_prompt];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const deploy = useCallback(
    async (version: string) => {
      setIsDeploying(true);
      try {
        await deployPrompt(version);
        // Update local state
        setPrompts((prev) =>
          prev.map((p) => ({
            ...p,
            is_active: p.version === version,
            status: p.version === version ? 'ACTIVE' as const : p.status === 'ACTIVE' ? 'ARCHIVED' as const : p.status,
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deploy prompt');
      } finally {
        setIsDeploying(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    activePrompt,
    isLoading,
    isGenerating,
    isDeploying,
    improveResult,
    error,
    generate,
    deploy,
    generationStep,
  };
}
