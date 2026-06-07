'use client';

import { Zap, Sparkles, Loader2 } from 'lucide-react';
import { PromptVersion } from '@/types';

interface ActivePromptBannerProps {
  prompt: PromptVersion;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function ActivePromptBanner({
  prompt,
  onGenerate,
  isGenerating,
}: ActivePromptBannerProps) {
  return (
    <div className="glass-card p-6 hover:!transform-none relative overflow-hidden glow-accent">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/3 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 animate-pulse-ring border-2 border-surface" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Active Prompt
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-white">Version {prompt.version.replace('V', '')}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {prompt.accuracy}% accuracy
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 font-medium">
                {prompt.diagnosis_count} diagnoses
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-semibold text-sm hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Improved Prompt
            </>
          )}
        </button>
      </div>
    </div>
  );
}
