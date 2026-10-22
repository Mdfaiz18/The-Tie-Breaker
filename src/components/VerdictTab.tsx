import React, { useState } from 'react';
import { DecisionAnalysis } from '../types/decision';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  AlertOctagon, 
  CheckSquare, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ChevronRight, 
  ShieldAlert, 
  Lightbulb, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
  onOpenPreMortem?: () => void;
  onOpenCoinFlip?: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const VerdictTab: React.FC<Props> = ({ decision, onOpenPreMortem, onOpenCoinFlip }) => {
  const { verdict } = decision;

  // 48h Action plan checkbox state
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Follow-up Copilot state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAskCopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = inputQuestion.trim();
    if (!q || isCopilotLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setInputQuestion('');
    setIsCopilotLoading(true);

    try {
      const res = await fetch('/api/copilot-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionContext: {
            title: decision.title,
            context: decision.context,
            winner: verdict.winnerOptionName,
            headline: verdict.headline,
            factors: verdict.coreDecidingFactors,
          },
          userQuestion: q,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }]);
      }
    } catch (err: any) {
      setMessages([...newMessages, { role: 'assistant', content: 'Failed to communicate with the Copilot server.' }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const sampleQuestions = [
    `How should I break this decision to my team or partner?`,
    `What is the best contingency plan if this doesn't work out?`,
    `Give me a 3-step script to negotiate better terms before locking this in.`,
  ];

  return (
    <div className="space-y-8">
      {/* Hero Recommendation Card */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-950 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-indigo-900/50 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-3.5 h-3.5" /> The Tiebreaker Verdict
              </span>
              <span className="text-xs text-indigo-300/80 font-mono">Definitive Recommendation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-1">
              {verdict.winnerOptionName}
            </h2>

            <p className="text-base sm:text-lg text-indigo-200 font-medium italic leading-snug max-w-2xl">
              "{verdict.headline}"
            </p>
          </div>

          {/* Confidence Meter */}
          <div className="shrink-0 bg-slate-900/80 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-inner">
            <div className="text-right">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">AI Confidence</span>
              <div className="text-3xl font-black font-mono text-emerald-400">
                {verdict.confidencePercentage}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-emerald-400 border-r-indigo-400 flex items-center justify-center font-bold text-xs text-white">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="relative z-10 pt-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Summary & Strategic Rationale</h4>
          <div className="text-sm text-slate-200 leading-relaxed space-y-3 font-normal whitespace-pre-line">
            {verdict.executiveSummary}
          </div>
        </div>

        {/* Core Deciding Factors */}
        <div className="relative z-10 mt-6 pt-6 border-t border-indigo-900/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" /> What Tipped The Scale:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {verdict.coreDecidingFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-indigo-900/40 text-xs text-slate-200 flex items-start gap-2.5"
              >
                <span className="font-mono font-bold text-indigo-400 text-xs mt-0.5">0{idx + 1}.</span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons inside Card */}
        <div className="relative z-10 mt-6 pt-5 border-t border-indigo-900/40 flex flex-wrap gap-3">
          {onOpenPreMortem && (
            <button
              onClick={onOpenPreMortem}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-200 border border-rose-800/60 hover:bg-rose-900/60 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Flame className="w-4 h-4 text-rose-400" /> Run Pre-Mortem Stress Test
            </button>
          )}
          {onOpenCoinFlip && (
            <button
              onClick={onOpenCoinFlip}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-950/60 text-amber-200 border border-amber-800/60 hover:bg-amber-900/60 transition-all flex items-center gap-1.5 shadow-sm"
            >
              🪙 Psychological Coin Flip Test
            </button>
          )}
        </div>
      </div>

      {/* The Devil's Advocate / Inversion Framework */}
      <div className="rounded-2xl border border-rose-900/40 bg-gradient-to-br from-rose-950/20 via-slate-900 to-slate-950 p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-400">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
          <h3 className="text-base font-bold text-white tracking-tight">The Devil's Advocate: How This Recommendation Fails</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Charlie Munger taught: <em>"Invert, always invert."</em> High-conviction decisions require understanding the runner-up's true strength and the primary conditions where you would regret choosing this path.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">The Alternative Scenario</span>
            <p className="text-xs text-slate-200 leading-relaxed">{verdict.devilsAdvocate.alternativeScenario}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">The Potential Regret</span>
            <p className="text-xs text-slate-200 leading-relaxed">{verdict.devilsAdvocate.potentialRegret}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/40 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">When To Choose The Other</span>
            <p className="text-xs text-slate-200 leading-relaxed">{verdict.devilsAdvocate.whenToChooseTheOther}</p>
          </div>
        </div>
      </div>

      {/* Blind Spots & Mitigations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Blind Spot Audit & Guardrails</h3>
        </div>
        <p className="text-xs text-slate-400">
          Before taking action, audit these 3 unasked questions or hidden assumptions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {verdict.blindSpots.map((blind, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-xs font-bold">0{idx + 1}.</span>
                <h4 className="text-xs font-bold text-slate-100">{blind.title}</h4>
              </div>
              <div className="text-[11px] text-rose-300/90 leading-relaxed">
                <strong>Warning:</strong> {blind.warning}
              </div>
              <div className="text-[11px] text-emerald-300/90 leading-relaxed pt-1 border-t border-slate-800">
                <strong>Mitigation:</strong> {blind.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 48-Hour Action Plan */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">48-Hour Execution Blueprint</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Immediate Momentum</span>
        </div>

        <div className="space-y-3">
          {verdict.actionPlan48h.map((step, idx) => {
            const isDone = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400 opacity-60 line-through'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleStep(idx)}
                  className="mt-1 rounded accent-indigo-500 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-100">{step.step}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                      {step.timeline}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed font-normal">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Psychological Gut-Check Prompt */}
      {verdict.gutCheckPrompt && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20 border border-amber-900/30 flex items-start gap-3">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Lightbulb className="w-5 h-5" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Intuition & Gut Alignment</h4>
            <p className="text-sm text-slate-200 mt-1 italic leading-relaxed">
              "{verdict.gutCheckPrompt}"
            </p>
          </div>
        </div>
      )}

      {/* Interactive Follow-up Copilot */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Ask The Tiebreaker Copilot</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Real-time follow-up Q&A</span>
        </div>

        <p className="text-xs text-slate-400">
          Have specific caveats or follow-up questions? Ask for negotiation scripts, alternative timelines, or risk mitigations tailored to this decision.
        </p>

        {/* Preset prompts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInputQuestion(sq);
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/50 transition-colors text-left"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        {messages.length > 0 && (
          <div className="space-y-3 pt-2 max-h-96 overflow-y-auto pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 ${
                  msg.role === 'user'
                    ? 'bg-indigo-950/40 border border-indigo-900/50 text-indigo-100 ml-6'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 mr-6'
                }`}
              >
                <span className="p-1 rounded-md bg-slate-800 text-slate-400 shrink-0">
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
                </span>
                <div className="flex-1 whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* Input box */}
        <form onSubmit={handleAskCopilot} className="flex gap-2 pt-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a tactical follow-up (e.g. 'How do I negotiate without burning bridges?')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isCopilotLoading || !inputQuestion.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 shrink-0"
          >
            {isCopilotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Ask
          </button>
        </form>
      </div>
    </div>
  );
};
