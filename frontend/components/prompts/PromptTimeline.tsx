'use client';

import { PromptVersion } from '@/types';
import PromptVersionCard from './PromptVersionCard';

interface PromptTimelineProps {
  prompts: PromptVersion[];
}

export default function PromptTimeline({ prompts }: PromptTimelineProps) {
  const sorted = [...prompts].sort((a, b) => {
    // V1 first, then V2, etc
    const numA = parseInt(a.version.replace('V', ''));
    const numB = parseInt(b.version.replace('V', ''));
    return numA - numB;
  });

  return (
    <div className="glass-card p-6 hover:!transform-none">
      <h3 className="text-sm font-semibold text-white mb-4">Prompt Timeline</h3>
      <div>
        {sorted.map((prompt, i) => (
          <PromptVersionCard
            key={prompt.version}
            prompt={prompt}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
