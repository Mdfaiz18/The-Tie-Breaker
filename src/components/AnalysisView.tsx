import React, { useState } from 'react';
import { DecisionAnalysis } from '../types/decision';
import { ProsConsTab } from './ProsConsTab';
import { ComparisonMatrixTab } from './ComparisonMatrixTab';
import { SwotTab } from './SwotTab';
import { VerdictTab } from './VerdictTab';
import { PreMortemModal } from './PreMortemModal';
import { CoinFlipModal } from './CoinFlipModal';
import { exportDecisionAsMarkdown, saveDecision } from '../utils/storage';
import { 
  Trophy, 
  Scale, 
  Table, 
  Compass, 
  Sparkles, 
  Download, 
  Share2, 
  Flame, 
  Coins, 
  Check, 
  ArrowLeft,
  Calendar,
  Layers
} from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
  onBackToEdit: () => void;
  onUpdateDecision: (updated: DecisionAnalysis) => void;
}

type TabType = 'pros-cons' | 'comparison-table' | 'swot' | 'verdict';

export const AnalysisView: React.FC<Props> = ({
  decision,
  onBackToEdit,
  onUpdateDecision,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('verdict');
  const [showPreMortem, setShowPreMortem] = useState(false);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportMarkdown = () => {
    const md = exportDecisionAsMarkdown(decision);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-${decision.title.slice(0, 30).toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = async () => {
    const summaryText = `THE TIEBREAKER VERDICT:\n\nDilemma: ${decision.title}\nWinner: ${decision.verdict.winnerOptionName} (${decision.verdict.confidencePercentage}% confidence)\nHeadline: "${decision.verdict.headline}"\n\nExecutive Summary:\n${decision.verdict.executiveSummary}\n\nCore Deciding Factors:\n${decision.verdict.coreDecidingFactors.map((f, i) => `${i + 1}. ${f}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Quick Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <button
          onClick={onBackToEdit}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors group self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Edit Decision Inputs</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <button
            onClick={() => setShowPreMortem(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Pre-Mortem</span>
          </button>

          <button
            onClick={() => setShowCoinFlip(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🪙 Coin Flip</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center gap-1.5"
            title="Copy Executive Summary to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            title="Download Full Markdown Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Decision Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Lens: {decision.persona.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(decision.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {decision.title}
            </h1>
            {decision.context && (
              <p className="text-xs text-slate-400 leading-relaxed font-normal max-w-3xl italic">
                "{decision.context}"
              </p>
            )}
          </div>

          {/* Quick Winner Badge */}
          <div className="shrink-0 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-slate-950 border border-indigo-500/40 text-right self-start">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block flex items-center justify-end gap-1">
              <Trophy className="w-3 h-3 text-amber-400" /> Winning Choice
            </span>
            <div className="text-base sm:text-lg font-black text-white mt-0.5">
              {decision.verdict.winnerOptionName}
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              {decision.verdict.confidencePercentage}% Confidence
            </span>
          </div>
        </div>

        {/* Options Overview Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/80">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" /> Options Evaluated:
          </span>
          {decision.options.map((opt, i) => {
            const isWinner = opt.id === decision.verdict.winnerOptionId;
            return (
              <div
                key={opt.id}
                className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shrink-0 border ${
                  isWinner
                    ? 'bg-indigo-950/40 border-indigo-500/50 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-indigo-400 font-mono font-bold">{String.fromCharCode(65 + i)}.</span>
                <span>{opt.name}</span>
                {isWinner && <Trophy className="w-3 h-3 text-amber-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 4 Analytical Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('verdict')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'verdict'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl'
          }`}
        >
          <Trophy className={`w-4 h-4 ${activeTab === 'verdict' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>The Verdict</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
            Recommendation
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pros-cons')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'pros-cons'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl'
          }`}
        >
          <Scale className={`w-4 h-4 ${activeTab === 'pros-cons' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>Pros & Cons</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comparison-table')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'comparison-table'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl'
          }`}
        >
          <Table className={`w-4 h-4 ${activeTab === 'comparison-table' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>Comparison Matrix</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            Weighted
          </span>
        </button>

        <button
          onClick={() => setActiveTab('swot')}
          className={`py-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'swot'
              ? 'border-indigo-500 text-white bg-indigo-500/10 rounded-t-xl'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 rounded-t-xl'
          }`}
        >
          <Compass className={`w-4 h-4 ${activeTab === 'swot' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <span>SWOT Analysis</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
            Strategic
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'verdict' && (
          <VerdictTab
            decision={decision}
            onOpenPreMortem={() => setShowPreMortem(true)}
            onOpenCoinFlip={() => setShowCoinFlip(true)}
          />
        )}

        {activeTab === 'pros-cons' && (
          <ProsConsTab decision={decision} onUpdateDecision={onUpdateDecision} />
        )}

        {activeTab === 'comparison-table' && (
          <ComparisonMatrixTab decision={decision} />
        )}

        {activeTab === 'swot' && <SwotTab decision={decision} />}
      </div>

      {/* Modals */}
      {showPreMortem && (
        <PreMortemModal decision={decision} onClose={() => setShowPreMortem(false)} />
      )}

      {showCoinFlip && (
        <CoinFlipModal decision={decision} onClose={() => setShowCoinFlip(false)} />
      )}
    </div>
  );
};
