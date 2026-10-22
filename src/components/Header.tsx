import React from 'react';
import { Scale, Clock, PlusCircle, Sparkles } from 'lucide-react';

interface Props {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  savedCount: number;
  hasActiveDecision: boolean;
}

export const Header: React.FC<Props> = ({
  onNewDecision,
  onOpenHistory,
  savedCount,
  hasActiveDecision,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={onNewDecision}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                The Tiebreaker
              </span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-normal">
              Pros/Cons • Comparison Table • SWOT • Verdict
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {hasActiveDecision && (
            <button
              onClick={onNewDecision}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">New Decision</span>
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center gap-2 relative"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
