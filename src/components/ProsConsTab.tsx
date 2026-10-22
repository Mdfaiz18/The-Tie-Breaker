import React, { useState } from 'react';
import { DecisionAnalysis, OptionProCon, ProConItem } from '../types/decision';
import { CheckCircle2, XCircle, Filter, Eye, EyeOff, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
  onUpdateDecision?: (updated: DecisionAnalysis) => void;
}

export const ProsConsTab: React.FC<Props> = ({ decision, onUpdateDecision }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(decision.options[0]?.id || '');
  const [filterImpact, setFilterImpact] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'single'>('side-by-side');

  const currentOptionPC = decision.prosAndCons.find((pc) => pc.optionId === selectedOptionId) || decision.prosAndCons[0];

  const handleToggleItem = (optionId: string, itemId: string, isPro: boolean) => {
    if (!onUpdateDecision) return;
    const updatedPCs = decision.prosAndCons.map((pc) => {
      if (pc.optionId !== optionId) return pc;
      if (isPro) {
        return {
          ...pc,
          pros: pc.pros.map((p) => (p.id === itemId ? { ...p, userDisabled: !p.userDisabled } : p)),
        };
      } else {
        return {
          ...pc,
          cons: pc.cons.map((c) => (c.id === itemId ? { ...c, userDisabled: !c.userDisabled } : c)),
        };
      }
    });

    onUpdateDecision({
      ...decision,
      prosAndCons: updatedPCs,
    });
  };

  const calculateOptionScore = (pc: OptionProCon) => {
    const activePros = pc.pros.filter((p) => !p.userDisabled);
    const activeCons = pc.cons.filter((c) => !c.userDisabled);

    const proScore = activePros.reduce((sum, p) => sum + (p.score || 5), 0);
    const conScore = activeCons.reduce((sum, c) => sum + (c.score || 5), 0);
    const net = proScore - conScore;

    return {
      proScore,
      conScore,
      net,
      proCount: activePros.length,
      conCount: activeCons.length,
      disabledCount: (pc.pros.length - activePros.length) + (pc.cons.length - activeCons.length),
    };
  };

  const filterItems = (items: ProConItem[]) => {
    if (filterImpact === 'All') return items;
    return items.filter((i) => i.impact === filterImpact);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Options:
          </span>
          {decision.options.map((opt) => {
            const pc = decision.prosAndCons.find((p) => p.optionId === opt.id);
            const stats = pc ? calculateOptionScore(pc) : null;
            const isWinner = decision.verdict.winnerOptionId === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedOptionId === opt.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <span>{opt.name}</span>
                {stats && (
                  <span
                    className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                      stats.net >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {stats.net >= 0 ? `+${stats.net}` : stats.net}
                  </span>
                )}
                {isWinner && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="The Tiebreaker Recommended Choice" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Impact Filter */}
          <div className="flex items-center gap-1 text-xs bg-slate-800/90 p-1 rounded-lg border border-slate-700/60">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['All', 'High', 'Medium', 'Low'] as const).map((impact) => (
              <button
                key={impact}
                onClick={() => setFilterImpact(impact)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  filterImpact === impact
                    ? 'bg-slate-700 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {impact}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="hidden lg:flex items-center bg-slate-800/90 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'side-by-side' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-2 py-0.5 rounded transition-colors ${
                viewMode === 'single' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Single
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-side multi-option comparison or single option view */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {decision.prosAndCons.map((pc) => {
            const stats = calculateOptionScore(pc);
            const isWinner = decision.verdict.winnerOptionId === pc.optionId;
            const filteredPros = filterItems(pc.pros);
            const filteredCons = filterItems(pc.cons);

            return (
              <div
                key={pc.optionId}
                className={`rounded-2xl border transition-all p-5 flex flex-col bg-slate-900/50 backdrop-blur-sm ${
                  isWinner
                    ? 'border-indigo-500/50 shadow-xl shadow-indigo-950/30 ring-1 ring-indigo-500/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Header for Option */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white tracking-tight">{pc.optionName}</h3>
                      {isWinner && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Winner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">{pc.summary}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-slate-400">Net Score</div>
                    <div
                      className={`text-2xl font-bold font-mono ${
                        stats.net > 0 ? 'text-emerald-400' : stats.net < 0 ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {stats.net > 0 ? `+${stats.net}` : stats.net}
                    </div>
                  </div>
                </div>

                {/* Score balance meter */}
                <div className="mb-5 space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{stats.proScore} Pros Score
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      -{stats.conScore} Cons Severity <ArrowDownRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.max(5, (stats.proScore / (stats.proScore + stats.conScore || 1)) * 100)}%`,
                      }}
                    />
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.max(5, (stats.conScore / (stats.proScore + stats.conScore || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  {stats.disabledCount > 0 && (
                    <div className="text-[11px] text-amber-400/90 text-right flex items-center justify-end gap-1 pt-0.5">
                      <EyeOff className="w-3 h-3" /> {stats.disabledCount} point{stats.disabledCount > 1 ? 's' : ''} toggled off
                    </div>
                  )}
                </div>

                {/* Pros Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Pros ({filteredPros.length})
                    </div>
                    <span className="text-[11px] text-slate-500">Tap checkbox to include/exclude</span>
                  </div>

                  <div className="space-y-2.5">
                    {filteredPros.map((pro) => (
                      <div
                        key={pro.id}
                        className={`group p-3 rounded-xl border transition-all text-xs ${
                          pro.userDisabled
                            ? 'bg-slate-950/40 border-slate-800/40 opacity-40 line-through'
                            : 'bg-emerald-950/15 border-emerald-900/30 hover:border-emerald-700/50 hover:bg-emerald-950/25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleItem(pc.optionId, pro.id, true)}
                            className="mt-0.5 shrink-0 text-emerald-400 hover:text-emerald-300"
                            title={pro.userDisabled ? 'Re-enable this pro' : 'Ignore this pro in calculation'}
                          >
                            {pro.userDisabled ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-semibold text-slate-100 text-[13px]">{pro.text}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                                  {pro.category}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    pro.impact === 'High'
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  +{pro.score}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1.5 text-slate-300 text-xs leading-relaxed font-normal">{pro.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cons Section */}
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400">
                      <XCircle className="w-4 h-4" /> Cons ({filteredCons.length})
                    </div>
                    <span className="text-[11px] text-slate-500">Tap checkbox to include/exclude</span>
                  </div>

                  <div className="space-y-2.5">
                    {filteredCons.map((con) => (
                      <div
                        key={con.id}
                        className={`group p-3 rounded-xl border transition-all text-xs ${
                          con.userDisabled
                            ? 'bg-slate-950/40 border-slate-800/40 opacity-40 line-through'
                            : 'bg-rose-950/15 border-rose-900/30 hover:border-rose-700/50 hover:bg-rose-950/25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleItem(pc.optionId, con.id, false)}
                            className="mt-0.5 shrink-0 text-rose-400 hover:text-rose-300"
                            title={con.userDisabled ? 'Re-enable this con' : 'Ignore this con in calculation'}
                          >
                            {con.userDisabled ? (
                              <EyeOff className="w-4 h-4 text-slate-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 fill-rose-500/20" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-semibold text-slate-100 text-[13px]">{con.text}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                                  {con.category}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                    con.impact === 'High'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  -{con.score}
                                </span>
                              </div>
                            </div>
                            <p className="mt-1.5 text-slate-300 text-xs leading-relaxed font-normal">{con.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Single View Focus */
        currentOptionPC && (
          <div className="rounded-2xl border border-slate-800 p-6 bg-slate-900/50 backdrop-blur-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{currentOptionPC.optionName}</h3>
                <p className="text-sm text-slate-400 mt-1 italic">{currentOptionPC.summary}</p>
              </div>
              {(() => {
                const stats = calculateOptionScore(currentOptionPC);
                return (
                  <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-mono">Net Score</span>
                      <span
                        className={`text-2xl font-bold font-mono ${
                          stats.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stats.net >= 0 ? `+${stats.net}` : stats.net}
                      </span>
                    </div>
                    <div className="border-l border-slate-800 pl-4 text-xs space-y-1">
                      <div className="text-emerald-400">Pros: +{stats.proScore}</div>
                      <div className="text-rose-400">Cons: -{stats.conScore}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pros */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Pros ({currentOptionPC.pros.length})
                </h4>
                <div className="space-y-3">
                  {filterItems(currentOptionPC.pros).map((pro) => (
                    <div
                      key={pro.id}
                      className={`p-3.5 rounded-xl border ${
                        pro.userDisabled
                          ? 'bg-slate-950/30 border-slate-800/40 opacity-40 line-through'
                          : 'bg-emerald-950/20 border-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(currentOptionPC.optionId, pro.id, true)}
                          className="mt-0.5 text-emerald-400"
                        >
                          {pro.userDisabled ? <EyeOff className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-100">{pro.text}</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">+{pro.score}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{pro.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cons */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Cons ({currentOptionPC.cons.length})
                </h4>
                <div className="space-y-3">
                  {filterItems(currentOptionPC.cons).map((con) => (
                    <div
                      key={con.id}
                      className={`p-3.5 rounded-xl border ${
                        con.userDisabled
                          ? 'bg-slate-950/30 border-slate-800/40 opacity-40 line-through'
                          : 'bg-rose-950/20 border-rose-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleItem(currentOptionPC.optionId, con.id, false)}
                          className="mt-0.5 text-rose-400"
                        >
                          {con.userDisabled ? <EyeOff className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-100">{con.text}</span>
                            <span className="text-xs font-mono font-bold text-rose-400">-{con.score}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{con.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
