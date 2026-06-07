'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AccuracyHeroProps {
  accuracy: number;
  total: number;
  correct: number;
  incorrect: number;
}

export default function AccuracyHero({ accuracy, total, correct, incorrect }: AccuracyHeroProps) {
  const [displayAccuracy, setDisplayAccuracy] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [displayCorrect, setDisplayCorrect] = useState(0);
  const [displayIncorrect, setDisplayIncorrect] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 50;

    const animateValue = (
      target: number,
      setter: React.Dispatch<React.SetStateAction<number>>
    ) => {
      const stepValue = target / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += stepValue;
        if (current >= target) {
          setter(target);
          clearInterval(interval);
        } else {
          setter(Math.round(current));
        }
      }, duration / steps);
      return interval;
    };

    const i1 = animateValue(accuracy, setDisplayAccuracy);
    const i2 = animateValue(total, setDisplayTotal);
    const i3 = animateValue(correct, setDisplayCorrect);
    const i4 = animateValue(incorrect, setDisplayIncorrect);

    return () => {
      clearInterval(i1);
      clearInterval(i2);
      clearInterval(i3);
      clearInterval(i4);
    };
  }, [accuracy, total, correct, incorrect]);

  return (
    <div className="glass-card p-8 hover:!transform-none relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative">
        <div className="text-center mb-6">
          <p className="text-8xl font-bold gradient-text leading-none mb-2">
            {displayAccuracy}%
          </p>
          <p className="text-lg text-text-muted font-medium">Overall Accuracy</p>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center">
              <span className="text-sm">📊</span>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{displayTotal}</p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-emerald-400">{displayCorrect}</p>
              <p className="text-xs text-text-muted">Correct</p>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">{displayIncorrect}</p>
              <p className="text-xs text-text-muted">Incorrect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
