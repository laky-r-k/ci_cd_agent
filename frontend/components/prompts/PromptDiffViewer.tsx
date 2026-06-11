'use client';

import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { DiffLine } from '@/types';

interface PromptDiffViewerProps {
  diff: DiffLine[];
  fromVersion: string;
  toVersion: string;
}

export default function PromptDiffViewer({ diff, fromVersion, toVersion }: PromptDiffViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = diff.map((l) => {
      if (l.type === 'added') return `+ ${l.content}`;
      if (l.type === 'removed') return `- ${l.content}`;
      return `  ${l.content}`;
    }).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = diff.map((l) => {
      if (l.type === 'added') return `+ ${l.content}`;
      if (l.type === 'removed') return `- ${l.content}`;
      return `  ${l.content}`;
    }).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-diff-${fromVersion}-${toVersion}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addedCount = diff.filter((l) => l.type === 'added').length;
  const removedCount = diff.filter((l) => l.type === 'removed').length;

  let lineNum = 0;

  return (
    <div className="glass-card overflow-hidden hover:!transform-none">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-background/30">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">
            {fromVersion} → {toVersion} Changes
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400">+{addedCount}</span>
            <span className="text-red-400">-{removedCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Copy diff"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-text-muted" />
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Download diff"
          >
            <Download className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="overflow-x-auto">
        <pre className="text-xs font-mono leading-relaxed">
          {/* Section header */}
          <div className="px-5 py-1.5 bg-purple-500/5 text-purple-300 border-l-3 border-purple-500/30">
            @@ Prompt Classification Instructions @@
          </div>
          {diff.map((line, i) => {
            lineNum++;
            const lineClass =
              line.type === 'added'
                ? 'diff-added'
                : line.type === 'removed'
                ? 'diff-removed'
                : 'diff-unchanged';
            const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

            return (
              <div
                key={i}
                className={`flex ${lineClass} hover:brightness-110 transition-all`}
              >
                <span className="w-10 text-right pr-3 text-slate-600 select-none flex-shrink-0 border-r border-border/30">
                  {lineNum}
                </span>
                <span className="w-5 text-center flex-shrink-0 font-bold">
                  {prefix}
                </span>
                <span className="flex-1 px-2 py-0.5 whitespace-pre-wrap break-words">
                  {line.content || '\u00A0'}
                </span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
