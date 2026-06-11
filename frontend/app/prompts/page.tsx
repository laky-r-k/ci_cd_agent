'use client';

import { useState } from 'react';
import { usePrompts } from '@/hooks/usePrompts';
import ActivePromptBanner from '@/components/prompts/ActivePromptBanner';
import PromptTimeline from '@/components/prompts/PromptTimeline';
import PromptDiffViewer from '@/components/prompts/PromptDiffViewer';
import AccuracyCompareChart from '@/components/prompts/AccuracyCompareChart';
import IntrospectionResults from '@/components/prompts/IntrospectionResults';
import PromptGeneratorModal from '@/components/prompts/PromptGeneratorModal';
import { Rocket, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromptsPage() {
  const {
    prompts,
    activePrompt,
    isLoading,
    isGenerating,
    isDeploying,
    improveResult,
    generate,
    deploy,
    generationStep,
  } = usePrompts();

  const [showModal, setShowModal] = useState(false);
  const [showDeployConfirm, setShowDeployConfirm] = useState(false);
  const [deployVersion, setDeployVersion] = useState('');

  const handleGenerate = async () => {
    setShowModal(true);
    await generate();
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeployClick = (version: string) => {
    setDeployVersion(version);
    setShowDeployConfirm(true);
  };

  const handleConfirmDeploy = async () => {
    try {
      await deploy(deployVersion);
      setShowDeployConfirm(false);
      toast.success(`Prompt ${deployVersion} deployed successfully!`);
    } catch {
      toast.error('Failed to deploy prompt');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-32 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-64" />
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  }

  if (!activePrompt) return null;

  const proposedPrompt = prompts.find((p) => p.status === 'PROPOSED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white">Prompt Evolution</h1>
        <p className="text-sm text-text-muted mt-1">
          Self-improving prompts through MCP introspection and outcome analysis
        </p>
      </div>

      {/* Active Prompt Banner */}
      <div className="animate-fade-in-up-delay-1">
        <ActivePromptBanner
          prompt={activePrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      </div>

      {/* Timeline + Accuracy Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up-delay-2">
        <PromptTimeline prompts={prompts} />
        <AccuracyCompareChart prompts={prompts} />
      </div>

      {/* Introspection Results (shown after generation) */}
      {improveResult && (
        <div className="animate-fade-in-up">
          <IntrospectionResults data={improveResult.introspection} />
        </div>
      )}

      {/* Diff Viewer (shown after generation) */}
      {improveResult && (
        <div className="animate-fade-in-up">
          <PromptDiffViewer
            diff={improveResult.diff}
            fromVersion={activePrompt.version}
            toVersion={improveResult.proposed_prompt.version}
          />
        </div>
      )}

      {/* Proposed Prompt with Deploy */}
      {(proposedPrompt || improveResult) && (
        <div className="glass-card p-6 hover:!transform-none animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Proposed Prompt {(proposedPrompt || improveResult?.proposed_prompt)?.version}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {(proposedPrompt || improveResult?.proposed_prompt)?.accuracy}% projected accuracy
            </span>
          </div>
          <textarea
            defaultValue={(proposedPrompt || improveResult?.proposed_prompt)?.content}
            rows={12}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-accent/50 resize-y leading-relaxed"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={() =>
                handleDeployClick(
                  (proposedPrompt || improveResult?.proposed_prompt)?.version || ''
                )
              }
              disabled={isDeploying}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold text-sm hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Deploy {(proposedPrompt || improveResult?.proposed_prompt)?.version}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Generator Modal */}
      <PromptGeneratorModal
        isOpen={showModal && isGenerating}
        step={generationStep}
        onClose={handleCloseModal}
      />

      {/* Deploy Confirmation Modal */}
      {showDeployConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeployConfirm(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up">
            <button
              onClick={() => setShowDeployConfirm(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Deploy {deployVersion}?</h2>
              <p className="text-sm text-text-muted mt-2">
                This will become the active prompt for all future diagnoses. The current prompt will
                be archived.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/20 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Accuracy improvement</span>
                <span className="text-emerald-400 font-bold">
                  {activePrompt.accuracy}% → {(proposedPrompt || improveResult?.proposed_prompt)?.accuracy}%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeployConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border text-text-muted font-medium text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeploy}
                disabled={isDeploying}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isDeploying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Deploy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
