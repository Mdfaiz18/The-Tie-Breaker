import React, { useState, useEffect } from 'react';
import { DecisionAnalysis, DecisionPersona } from './types/decision';
import { Header } from './components/Header';
import { DecisionInputForm } from './components/DecisionInputForm';
import { AnalysisView } from './components/AnalysisView';
import { HistoryDrawer } from './components/HistoryDrawer';
import { getSavedDecisions, saveDecision, deleteDecision } from './utils/storage';
import { 
  Scale, 
  Sparkles, 
  AlertCircle, 
  BrainCircuit, 
  CheckCircle2, 
  Layers, 
  Table, 
  Compass, 
  Trophy,
  ArrowRight
} from 'lucide-react';

const LOADING_STEPS = [
  'Extracting options and framing the dilemma...',
  'Compiling granular pros & cons with impact scoring...',
  'Constructing weighted multi-criteria comparison matrix...',
  'Synthesizing 2x2 SWOT strategic reality checks...',
  'Auditing blind spots and formulating the Tiebreaker verdict...',
];

export default function App() {
  const [currentDecision, setCurrentDecision] = useState<DecisionAnalysis | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved decisions on mount
  useEffect(() => {
    const list = getSavedDecisions();
    setSavedDecisions(list);
    if (list.length > 0 && !currentDecision) {
      // Don't auto-open unless user wants, but we can keep list ready
    }
  }, []);

  // Step cycling during loading
  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnalyze = async (formData: {
    title: string;
    context: string;
    options: string[];
    priorities: string[];
    persona: DecisionPersona;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${response.status}`);
      }

      const result: DecisionAnalysis = await response.json();

      setCurrentDecision(result);
      saveDecision(result);
      setSavedDecisions(getSavedDecisions());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(
        err.message || 'An error occurred while analyzing the decision. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDecision = (d: DecisionAnalysis) => {
    setCurrentDecision(d);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDecision = (id: string) => {
    deleteDecision(id);
    const updated = getSavedDecisions();
    setSavedDecisions(updated);
    if (currentDecision?.id === id) {
      setCurrentDecision(null);
    }
  };

  const handleUpdateCurrentDecision = (updated: DecisionAnalysis) => {
    setCurrentDecision(updated);
    saveDecision(updated);
    setSavedDecisions(getSavedDecisions());
  };

  const handleNewDecision = () => {
    setCurrentDecision(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        onNewDecision={handleNewDecision}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedCount={savedDecisions.length}
        hasActiveDecision={!!currentDecision}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong>Analysis Failed:</strong> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading ? (
          <div className="max-w-xl mx-auto py-20 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {LOADING_STEPS[loadingStepIdx]}
              </h3>
              <p className="text-xs text-slate-400">
                Employing Multi-Attribute Utility Theory, SWOT matrices & Inversion frameworks...
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pros & Cons Lists with Impact Scores</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Interactive Criteria Comparison Matrix</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SWOT Quadrants & Strategic Takeaways</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Definitive Tiebreaker Verdict & Devil's Advocate</span>
              </div>
            </div>
          </div>
        ) : currentDecision ? (
          <AnalysisView
            decision={currentDecision}
            onBackToEdit={() => setCurrentDecision(null)}
            onUpdateDecision={handleUpdateCurrentDecision}
          />
        ) : (
          <div className="space-y-12">
            {/* Hero Banner */}
            <div className="text-center space-y-4 max-w-3xl mx-auto pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>The Executive Decision Science Engine</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Stop Second-Guessing. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-amber-300">
                  Break The Tie With AI.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Provide any career, financial, business, or lifestyle dilemma. Get an objective, structured breakdown with dynamic pros & cons lists, a weighted comparison table, SWOT analysis, and a decisive verdict.
              </p>
            </div>

            {/* Input Form */}
            <DecisionInputForm onSubmit={handleAnalyze} isLoading={isLoading} />

            {/* Decision Frameworks Feature Strip */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6 border-t border-slate-900">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Weighted Pros & Cons</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Beyond simple tallies: every pro and con is assigned an impact rating and severity score with live net score calculations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Table className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Interactive Criteria Matrix</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Adjust priority weights in real time with sliders to see how shifting personal values change the winning option.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">4-Quadrant SWOT</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dissect internal strengths & weaknesses against external market opportunities and existential threats.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">The Tiebreaker Verdict</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  No indecisive waffle: a definitive winning recommendation, devil's advocate stress-test, and 48-hour action roadmap.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={handleSelectDecision}
        onDeleteDecision={handleDeleteDecision}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">The Tiebreaker</span>
            <span>— Clarifying tough choices with structured intelligence.</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Powered by Gemini 3.8 Flash • Local & Private Data
          </div>
        </div>
      </footer>
    </div>
  );
}
