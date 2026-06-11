'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, Search, Brain, Sparkles, Wand2 } from 'lucide-react';

interface PromptGeneratorModalProps {
  isOpen: boolean;
  step: number;
  onClose: () => void;
}

const steps = [
  { icon: Search, label: 'Querying Phoenix MCP...', color: 'text-cyan-400' },
  { icon: Brain, label: 'Analyzing weak spots...', color: 'text-purple-400' },
  { icon: Wand2, label: 'Generating improved prompt...', color: 'text-amber-400' },
  { icon: CheckCircle, label: 'Done! New version ready for review.', color: 'text-emerald-400' },
];

export default function PromptGeneratorModal({ isOpen, step, onClose }: PromptGeneratorModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step >= 4 ? onClose : undefined} />

      <div
        className={`relative bg-surface border border-border rounded-2xl p-8 w-full max-w-md shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Generating Improved Prompt</h2>
          <p className="text-sm text-text-muted mt-1">
            AI is analyzing performance and building a better prompt
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === i + 1;
            const isComplete = step > i + 1;
            const isPending = step < i + 1;

            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-white/5 border border-border'
                    : isComplete
                    ? 'opacity-60'
                    : isPending
                    ? 'opacity-30'
                    : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete
                      ? 'bg-emerald-500/10'
                      : isActive
                      ? 'bg-white/5'
                      : 'bg-white/3'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className={`w-5 h-5 ${s.color} animate-spin`} />
                  ) : isComplete ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Icon className={`w-5 h-5 text-slate-600`} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-white' : isComplete ? 'text-text-muted' : 'text-slate-600'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Done state */}
        {step >= 4 && (
          <div className="mt-6 animate-fade-in-up">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all"
            >
              View Results
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
