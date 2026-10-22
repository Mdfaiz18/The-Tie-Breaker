import React, { useState } from 'react';
import { DecisionAnalysis, MatrixCriterion } from '../types/decision';
import { Sliders, RotateCcw, Trophy, Info, Sparkles, Check, HelpCircle } from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
}

export const ComparisonMatrixTab: React.FC<Props> = ({ decision }) => {
  // Local state for interactive weights
  const [customWeights, setCustomWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    decision.comparisonMatrix.criteria.forEach((c) => {
      initial[c.id] = c.weight || 3;
    });
    return initial;
  });

  const [activeTooltipCriteriaId, setActiveTooltipCriteriaId] = useState<string | null>(null);

  const handleWeightChange = (criteriaId: string, newWeight: number) => {
    setCustomWeights((prev) => ({
      ...prev,
      [criteriaId]: newWeight,
    }));
  };

  const handleResetWeights = () => {
    const reset: Record<string, number> = {};
    decision.comparisonMatrix.criteria.forEach((c) => {
      reset[c.id] = c.weight || 3;
    });
    setCustomWeights(reset);
  };

  // Compute weighted scores for each option
  const totalWeight = Object.values(customWeights).reduce((a, b) => a + b, 0) || 1;

  const optionTotals: Record<string, { weightedSum: number; normalizedScore: number; rawTotal: number }> = {};
  decision.options.forEach((opt) => {
    let weightedSum = 0;
    let rawTotal = 0;

    decision.comparisonMatrix.criteria.forEach((crit) => {
      const weight = customWeights[crit.id] ?? 3;
      const row = decision.comparisonMatrix.scores.find((s) => s.criteriaId === crit.id);
      const rating = row?.ratings[opt.id]?.score ?? 5;

      weightedSum += rating * weight;
      rawTotal += rating;
    });

    const normalizedScore = Number((weightedSum / totalWeight).toFixed(1));
    optionTotals[opt.id] = { weightedSum, normalizedScore, rawTotal };
  });

  // Find the winning option under the current weights
  let currentLeaderId = decision.options[0]?.id;
  let highestScore = -1;
  decision.options.forEach((opt) => {
    const score = optionTotals[opt.id]?.normalizedScore ?? 0;
    if (score > highestScore) {
      highestScore = score;
      currentLeaderId = opt.id;
    }
  });

  const originalLeaderId = decision.verdict.winnerOptionId;
  const isWeightFlip = currentLeaderId !== originalLeaderId;

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-900/40 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">Dynamic Weighted Decision Matrix</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Every decision hinges on your personal weights. Adjust the priority sliders (1x to 5x) below to see in real-time how changing criteria importance influences the winning option.
            </p>
          </div>

          <button
            onClick={handleResetWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700 self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Weights
          </button>
        </div>

        {/* Live Leaderboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {decision.options.map((opt) => {
            const stats = optionTotals[opt.id];
            const isCurrentLeader = opt.id === currentLeaderId;

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentLeader
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium truncate max-w-[170px]">{opt.name}</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-2xl font-bold font-mono text-white">{stats?.normalizedScore}</span>
                      <span className="text-xs text-slate-400 font-mono">/ 10</span>
                    </div>
                  </div>
                  {isCurrentLeader && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Trophy className="w-3.5 h-3.5" /> Leads
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCurrentLeader ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, (stats?.normalizedScore ?? 0) * 10))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {isWeightFlip && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Priority Shift Detected:</strong> By weighting these criteria differently,{' '}
              <span className="text-white font-semibold underline">
                {decision.options.find((o) => o.id === currentLeaderId)?.name}
              </span>{' '}
              has overtaken the initial AI recommendation!
            </span>
          </div>
        )}
      </div>

      {/* Main Table Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] w-64 min-w-[200px]">
                  Evaluation Criteria
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[11px] w-48 min-w-[160px]">
                  Importance Weight
                </th>
                {decision.options.map((opt) => (
                  <th key={opt.id} className="py-3.5 px-4 font-semibold text-slate-200 min-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">{opt.name}</span>
                      {opt.id === currentLeaderId && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" title="Current Leader" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {decision.comparisonMatrix.criteria.map((crit) => {
                const weight = customWeights[crit.id] ?? 3;
                const scoreRow = decision.comparisonMatrix.scores.find((s) => s.criteriaId === crit.id);

                return (
                  <tr key={crit.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Criterion Info */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-100 text-[13px]">{crit.name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTooltipCriteriaId(activeTooltipCriteriaId === crit.id ? null : crit.id)
                            }
                            className="text-slate-500 hover:text-slate-300"
                            title="Show description"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40 inline-block">
                          {crit.category}
                        </span>
                        {(activeTooltipCriteriaId === crit.id || crit.description) && (
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{crit.description}</p>
                        )}
                      </div>
                    </td>

                    {/* Weight Slider */}
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Weight:</span>
                          <span className="font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/60">
                            {weight}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={weight}
                          onChange={(e) => handleWeightChange(crit.id, Number(e.target.value))}
                          className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>1 (Low)</span>
                          <span>3 (Norm)</span>
                          <span>5 (High)</span>
                        </div>
                      </div>
                    </td>

                    {/* Options Ratings */}
                    {decision.options.map((opt) => {
                      const rating = scoreRow?.ratings[opt.id];
                      const score = rating?.score ?? 5;
                      const isHigh = score >= 8;
                      const isLow = score <= 4;

                      return (
                        <td key={opt.id} className="py-4 px-4 align-top">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-base font-bold font-mono px-2 py-0.5 rounded-md ${
                                  isHigh
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : isLow
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                                }`}
                              >
                                {score} <span className="text-[10px] text-slate-400 font-normal">/10</span>
                              </span>
                              <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    isHigh ? 'bg-emerald-400' : isLow ? 'bg-rose-400' : 'bg-indigo-400'
                                  }`}
                                  style={{ width: `${score * 10}%` }}
                                />
                              </div>
                            </div>
                            {rating?.rationale && (
                              <p className="text-slate-300 text-[11px] leading-relaxed pt-1">{rating.rationale}</p>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950/90 border-t-2 border-slate-800 font-bold">
                <td colSpan={2} className="py-4 px-4 text-right text-xs uppercase tracking-wider text-slate-400">
                  Total Weighted Score (Out of 10):
                </td>
                {decision.options.map((opt) => {
                  const stats = optionTotals[opt.id];
                  const isLeader = opt.id === currentLeaderId;

                  return (
                    <td key={opt.id} className="py-4 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-2xl font-mono font-black ${
                            isLeader ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {stats?.normalizedScore}
                        </span>
                        {isLeader && (
                          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-0.5">
                            <Trophy className="w-3 h-3" /> Winner
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
