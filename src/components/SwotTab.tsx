import React, { useState } from 'react';
import { DecisionAnalysis, SWOTQuadrant } from '../types/decision';
import { ShieldCheck, AlertTriangle, TrendingUp, Skull, Compass, Sparkles } from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
}

export const SwotTab: React.FC<Props> = ({ decision }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(decision.options[0]?.id || '');

  const currentSwot = decision.swot.find((s) => s.optionId === selectedOptionId) || decision.swot[0];

  return (
    <div className="space-y-6">
      {/* Option Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-indigo-400" /> Inspect SWOT:
          </span>
          {decision.options.map((opt) => {
            const isWinner = decision.verdict.winnerOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  selectedOptionId === opt.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{opt.name}</span>
                {isWinner && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                    Winner
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {currentSwot && (
        <div className="space-y-6">
          {/* Strategic Takeaway Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/40 border border-indigo-900/50 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Strategic Reality Check for: {currentSwot.optionName}
                </h4>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed font-normal">
                  {currentSwot.strategicSummary}
                </p>
              </div>
            </div>
          </div>

          {/* 2x2 SWOT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-emerald-900/40 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white uppercase">Strengths</h4>
                  <span className="text-[11px] text-emerald-400/80 font-mono">Internal Assets & Superpowers</span>
                </div>
              </div>
              <ul className="space-y-2.5 pt-1">
                {currentSwot.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-400 border-b border-rose-900/40 pb-3">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white uppercase">Weaknesses</h4>
                  <span className="text-[11px] text-rose-400/80 font-mono">Internal Limitations & Bottlenecks</span>
                </div>
              </div>
              <ul className="space-y-2.5 pt-1">
                {currentSwot.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="p-5 rounded-2xl bg-sky-950/20 border border-sky-900/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-sky-400 border-b border-sky-900/40 pb-3">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white uppercase">Opportunities</h4>
                  <span className="text-[11px] text-sky-400/80 font-mono">External Trends & Tailwinds</span>
                </div>
              </div>
              <ul className="space-y-2.5 pt-1">
                {currentSwot.opportunities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/40 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-400 border-b border-amber-900/40 pb-3">
                <Skull className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold tracking-tight text-white uppercase">Threats</h4>
                  <span className="text-[11px] text-amber-400/80 font-mono">External Hazards & Tail-Risks</span>
                </div>
              </div>
              <ul className="space-y-2.5 pt-1">
                {currentSwot.threats.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
