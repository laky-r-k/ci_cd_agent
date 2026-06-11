'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, Wrench } from 'lucide-react';
import { ToolCall } from '@/types';

interface TracePanelProps {
  promptUsed?: string;
  agentResponse?: string;
  toolCalls?: ToolCall[];
}

function AccordionSection({
  title,
  icon,
  badge,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-white text-sm">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-4">{children}</div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-text-muted" />
      )}
    </button>
  );
}

export default function TracePanel({ promptUsed, agentResponse, toolCalls }: TracePanelProps) {
  return (
    <div className="glass-card overflow-hidden hover:!transform-none">
      <div className="px-5 py-3 border-b border-border bg-background/30">
        <h3 className="text-sm font-semibold text-white">Trace Details</h3>
      </div>

      <AccordionSection
        title="Prompt Used"
        icon={<span className="text-lg">📝</span>}
        defaultOpen={false}
      >
        <div className="relative">
          <div className="absolute top-2 right-2">
            <CopyButton text={promptUsed || ''} />
          </div>
          <pre className="bg-background rounded-lg p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap border border-border/50">
            {promptUsed || 'No prompt data available'}
          </pre>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Agent Response"
        icon={<span className="text-lg">🤖</span>}
        defaultOpen={true}
      >
        <div className="bg-background rounded-lg p-4 border border-border/50">
          <div className="prose prose-sm prose-invert max-w-none">
            {(agentResponse || 'No response available').split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3 last:mb-0">
                {para.split('**').map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-white font-semibold">
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </p>
            ))}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Tool Calls"
        icon={<Wrench className="w-4 h-4 text-text-muted" />}
        badge={`${toolCalls?.length || 0}`}
      >
        <div className="space-y-3">
          {toolCalls && toolCalls.length > 0 ? (
            toolCalls.map((call, i) => (
              <ToolCallCard key={i} call={call} index={i} />
            ))
          ) : (
            <p className="text-sm text-text-muted">No tool calls recorded</p>
          )}
        </div>
      </AccordionSection>
    </div>
  );
}

function ToolCallCard({ call, index }: { call: ToolCall; index: number }) {
  const [showInput, setShowInput] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div className="bg-background rounded-lg border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          <span className="font-mono text-sm text-cyan-300 font-medium">{call.name}</span>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-2">
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1"
        >
          {showInput ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Input
        </button>
        {showInput && (
          <pre className="text-xs font-mono text-slate-400 bg-slate-900/50 rounded p-3 overflow-x-auto">
            {JSON.stringify(call.input, null, 2)}
          </pre>
        )}

        <button
          onClick={() => setShowOutput(!showOutput)}
          className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1"
        >
          {showOutput ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Output
        </button>
        {showOutput && (
          <pre className="text-xs font-mono text-slate-400 bg-slate-900/50 rounded p-3 overflow-x-auto whitespace-pre-wrap">
            {call.output}
          </pre>
        )}
      </div>
    </div>
  );
}
