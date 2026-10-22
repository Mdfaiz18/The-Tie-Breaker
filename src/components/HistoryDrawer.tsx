import React from 'react';
import { DecisionAnalysis } from '../types/decision';
import { X, Clock, Trash2, ArrowRight, Download, Trophy, FileText } from 'lucide-react';
import { exportDecisionAsMarkdown } from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (d: DecisionAnalysis) => void;
  onDeleteDecision: (id: string) => void;
}

export const HistoryDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
}) => {
  if (!isOpen) return null;

  const handleDownloadMd = (d: DecisionAnalysis, e: React.MouseEvent) => {
    e.stopPropagation();
    const md = exportDecisionAsMarkdown(d);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `the-tiebreaker-${d.title.slice(0, 25).toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-base">Saved Decisions ({savedDecisions.length})</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
            {savedDecisions.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs">No saved decisions yet.</p>
                <p className="text-[11px] text-slate-600">
                  Analyze any dilemma and it will be safely saved to your local history.
                </p>
              </div>
            ) : (
              savedDecisions.map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    onSelectDecision(d);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-950 transition-all cursor-pointer group space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDownloadMd(d, e)}
                        className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                        title="Download Markdown Report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDecision(d.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        title="Delete this decision"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-white transition-colors">
                    {d.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> {d.verdict?.winnerOptionName}
                    </span>
                    <span className="text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 text-center">
          <p className="text-[11px] text-slate-500">Decisions are saved locally in your browser storage.</p>
        </div>
      </div>
    </div>
  );
};
