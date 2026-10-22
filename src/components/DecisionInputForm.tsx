import React, { useState } from 'react';
import { DecisionPersona } from '../types/decision';
import { PRESET_DECISIONS, DecisionPreset } from '../data/presets';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Compass, 
  SlidersHorizontal, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Coffee, 
  Scale, 
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  onSubmit: (formData: {
    title: string;
    context: string;
    options: string[];
    priorities: string[];
    persona: DecisionPersona;
  }) => void;
  isLoading: boolean;
}

const DEFAULT_PRIORITIES = [
  'Financial Upside',
  'Work-Life Harmony',
  'Career Velocity',
  'Job / Capital Security',
  'Autonomy & Freedom',
  'Low Stress',
  'Long-Term Net Worth',
  'Family & Relationships',
];

export const DecisionInputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Financial Upside',
    'Work-Life Harmony',
  ]);
  const [customPriority, setCustomPriority] = useState('');
  const [persona, setPersona] = useState<DecisionPersona>('balanced');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const togglePriority = (p: string) => {
    if (selectedPriorities.includes(p)) {
      setSelectedPriorities(selectedPriorities.filter((item) => item !== p));
    } else {
      setSelectedPriorities([...selectedPriorities, p]);
    }
  };

  const handleAddCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customPriority.trim();
    if (trimmed && !selectedPriorities.includes(trimmed)) {
      setSelectedPriorities([...selectedPriorities, trimmed]);
      setCustomPriority('');
    }
  };

  const loadPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setContext(preset.context);
    setOptions([...preset.options]);
    setSelectedPriorities([...preset.priorities]);
    setPersona(preset.persona);
    setShowAdvanced(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Filter out blank options
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);

    onSubmit({
      title: title.trim(),
      context: context.trim(),
      options: cleanOptions.length >= 2 ? cleanOptions : [],
      priorities: selectedPriorities,
      persona,
    });
  };

  const personas: Array<{ id: DecisionPersona; name: string; desc: string; icon: any }> = [
    { id: 'balanced', name: 'Balanced', desc: 'Prudent trade-offs across all aspects', icon: Scale },
    { id: 'aggressive_growth', name: 'Aggressive Growth', desc: 'Maximize long-term exponential upside', icon: TrendingUp },
    { id: 'risk_averse', name: 'Risk Averse', desc: 'Downside protection & peace of mind', icon: ShieldCheck },
    { id: 'financial_maximizer', name: 'Financial ROI', desc: 'Total wealth, savings & cash flow', icon: Coins },
    { id: 'lifestyle_first', name: 'Lifestyle First', desc: 'Freedom, health, and family time', icon: Coffee },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Preset Quick-Picks */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Need inspiration? Try a realistic dilemma:
          </span>
          <span className="text-slate-500 hidden sm:inline">Click to pre-fill</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_DECISIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => loadPreset(preset)}
              className="p-3 text-left rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold">{preset.category}</span>
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {preset.badge}
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium line-clamp-2 group-hover:text-white transition-colors">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm space-y-6 shadow-xl">
          {/* Dilemma Question */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>What decision do you need to make?</span>
              <span className="text-[11px] text-slate-500 font-normal">e.g. "Should I do X or Y?"</span>
            </label>
            <textarea
              required
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Should I accept an early-stage startup offer or stay at my stable corporate tech job? Or, Should I buy a house in 2026 or keep renting and investing?"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Explicit Options (Optional / Recommended) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Competing Options (2 to 4):
              </label>
              {options.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Option
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => (
                <div key={idx} className="relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-mono font-bold text-slate-500">
                    {String.fromCharCode(65 + idx)}.
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} (e.g. ${
                      idx === 0 ? 'Accept startup offer' : 'Stay at current job'
                    })`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="absolute right-2.5 text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Leave blank if you'd like AI to auto-formulate the optimal mutually exclusive options for your dilemma.
            </p>
          </div>

          {/* Toggle Advanced Constraints */}
          <div className="border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal Context, Constraints & Value Priorities</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Advanced Section */}
          {showAdvanced && (
            <div className="space-y-6 pt-2 animate-in fade-in duration-200">
              {/* Context Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Specific Background, Financial Figures, or Constraints:</span>
                  <span className="text-[11px] text-slate-500 font-normal">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="e.g. My spouse works remote, we have $80k in savings, mortgage rate is 6.5%, I have a baby due in 8 months, burnout level is 6/10..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Priority Chips */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">
                  What factors matter most to you in this decision?
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_PRIORITIES.map((p) => {
                    const isSelected = selectedPriorities.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {p}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Priority Input */}
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={customPriority}
                    onChange={(e) => setCustomPriority(e.target.value)}
                    placeholder="Add custom priority..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomPriority}
                    disabled={!customPriority.trim()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Decision Lens / Persona */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Select Your Evaluation Lens / Mindset:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {personas.map((item) => {
                    const Icon = item.icon;
                    const isSelected = persona === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPersona(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <span className="text-xs font-bold text-slate-200">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>The Tiebreaker is analyzing your decision...</span>
                </>
              ) : (
                <>
                  <Scale className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
                  <span>Break The Tie With AI</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2.5">
              Generates Pros & Cons lists, weighted comparison matrix, SWOT analysis & definitive verdict.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
