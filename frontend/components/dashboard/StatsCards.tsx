'use client';

import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Calendar, Target, Zap } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix?: string;
  color: string;
  glowColor: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, suffix = '', color, glowColor, delay }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    if (typeof value === 'string') return;

    const target = value;
    const duration = 800;
    const steps = 40;
    const stepValue = target / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value, isVisible]);

  return (
    <div
      ref={ref}
      className={`glass-card p-5 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
          style={{ boxShadow: `0 0 20px ${glowColor}` }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${color.includes('red') ? 'bg-red-400' : color.includes('orange') ? 'bg-orange-400' : color.includes('green') ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
        </div>
      </div>
      <p className="text-sm text-text-muted mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">
        {typeof value === 'string' ? value : displayValue}
        {suffix && <span className="text-lg text-text-muted ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

interface StatsCardsProps {
  failuresToday: number;
  failuresWeek: number;
  accuracy: number;
  activePrompt: string;
}

export default function StatsCards({
  failuresToday,
  failuresWeek,
  accuracy,
  activePrompt,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={AlertTriangle}
        label="Failures Today"
        value={failuresToday}
        color="bg-red-500/15 text-red-400"
        glowColor="rgba(239, 68, 68, 0.15)"
        delay={0}
      />
      <StatCard
        icon={Calendar}
        label="This Week"
        value={failuresWeek}
        color="bg-orange-500/15 text-orange-400"
        glowColor="rgba(245, 158, 11, 0.15)"
        delay={1}
      />
      <StatCard
        icon={Target}
        label="Accuracy"
        value={accuracy}
        suffix="%"
        color="bg-emerald-500/15 text-emerald-400"
        glowColor="rgba(16, 185, 129, 0.15)"
        delay={2}
      />
      <StatCard
        icon={Zap}
        label="Active Prompt"
        value={activePrompt}
        color="bg-cyan-500/15 text-cyan-400"
        glowColor="rgba(6, 182, 212, 0.15)"
        delay={3}
      />
    </div>
  );
}
