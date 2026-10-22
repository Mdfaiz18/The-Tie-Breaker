import React, { useState } from 'react';
import { DecisionAnalysis, PreMortemResult } from '../types/decision';
import { X, Flame, ShieldAlert, AlertTriangle, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
  onClose: () => void;
}

export const PreMortemModal: React.FC<Props> = ({ decision, onClose }) => {
  const [selectedOptionName, setSelectedOptionName] = useState(
    decision.verdict.winnerOptionName || decision.options[0]?.name || ''
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreMortemResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPreMortem = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pre-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle: decision.title,
          optionName: selectedOptionName,
          context: decision.context,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to conduct pre-mortem stress test.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runPreMortem();
  }, [selectedOptionName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl border border-rose-900/50 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Flame className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Pre-Mortem Stress Test</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                  Failure Simulator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                "Assume it is 12 months from now, and this choice failed miserably. What happened, and how do we prevent it?"
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Selector */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Select Option to Stress-Test:</span>
          {decision.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOptionName(opt.name)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedOptionName === opt.name
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.name}
            </button>
          ))}
          <button
            onClick={runPreMortem}
            disabled={loading}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40"
            title="Re-run simulation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Simulating catastrophic future failure mode...</p>
            <p className="text-xs text-slate-500">Uncovering subtle systemic blind spots for {selectedOptionName}</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
            {error}
          </div>
        ) : result ? (
          <div className="space-y-6">
            {/* Scenario Title */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 space-y-1.5">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400 block">
                The Hypothetical Disaster Scenario
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white italic">"{result.scenarioTitle}"</h4>
            </div>

            {/* Catastrophic Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Chronology of Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.catastrophicTimeline.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block">
                      {item.period}
                    </span>
                    <h5 className="text-xs font-bold text-slate-100">{item.event}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      <strong>Root cause:</strong> {item.rootCause}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Early Warning Signals & Preventative Shields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Signals */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Early Warning Signs (Day 1 - 60)
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.earlyWarningSignals.map((signal, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shields */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Preventative Shields to Deploy Now
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {result.preventativeShields.map((shield, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{shield}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-t border-slate-800 pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close Stress Test
          </button>
        </div>
      </div>
    </div>
  );
};
