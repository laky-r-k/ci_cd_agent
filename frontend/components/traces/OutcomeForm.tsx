'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { FailureCategory, FailureStatus, OutcomeResult } from '@/types';
import { submitOutcome } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface OutcomeFormProps {
  failureId: string;
  status: FailureStatus;
}

export default function OutcomeForm({ failureId, status }: OutcomeFormProps) {
  const [result, setResult] = useState<OutcomeResult | null>(null);
  const [actualCategory, setActualCategory] = useState<FailureCategory | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(status === 'OUTCOME_RECORDED');

  const handleSubmit = async () => {
    if (!result) return;
    setIsSubmitting(true);
    try {
      await submitOutcome(failureId, {
        result,
        actual_category: result === 'INCORRECT' && actualCategory ? actualCategory : undefined,
        notes: notes || undefined,
      });
      setSubmitted(true);
      toast.success('Outcome recorded successfully');
    } catch {
      toast.error('Failed to submit outcome');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card p-6 hover:!transform-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium text-white">Outcome Recorded</p>
            <p className="text-sm text-text-muted">
              Thank you for your feedback. This helps improve the AI model.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-lg font-semibold text-white mb-4">Was this diagnosis correct?</h3>

      {/* Radio buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setResult('CORRECT')}
          className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${
            result === 'CORRECT'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'border-border hover:border-border/80 hover:bg-white/[0.02] text-text-muted'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Correct</span>
        </button>
        <button
          onClick={() => setResult('INCORRECT')}
          className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition-all ${
            result === 'INCORRECT'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'border-border hover:border-border/80 hover:bg-white/[0.02] text-text-muted'
          }`}
        >
          <XCircle className="w-5 h-5" />
          <span className="font-medium">Incorrect</span>
        </button>
      </div>

      {/* Incorrect: show category dropdown */}
      {result === 'INCORRECT' && (
        <div className="mb-4 animate-fade-in-up">
          <label className="block text-sm font-medium text-text-muted mb-2">
            What was the actual category?
          </label>
          <select
            value={actualCategory}
            onChange={(e) => setActualCategory(e.target.value as FailureCategory)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-muted mb-2">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional context about this diagnosis..."
          rows={3}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent/50 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!result || isSubmitting}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Outcome'
        )}
      </button>
    </div>
  );
}
