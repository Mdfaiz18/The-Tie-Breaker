import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DecisionAnalysis } from '../types/decision';
import { X, Sparkles, RefreshCw, Heart, AlertCircle } from 'lucide-react';

interface Props {
  decision: DecisionAnalysis;
  onClose: () => void;
}

export const CoinFlipModal: React.FC<Props> = ({ decision, onClose }) => {
  const optionA = decision.options[0]?.name || 'Option A';
  const optionB = decision.options[1]?.name || 'Option B';

  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'A' | 'B' | null>(null);
  const [rotation, setRotation] = useState(0);
  const [userReaction, setUserReaction] = useState<'relieved' | 'disappointed' | 'neutral' | null>(null);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);
    setUserReaction(null);

    // Random choice
    const isHeads = Math.random() > 0.5;
    const spins = 1800 + (isHeads ? 0 : 180) + Math.floor(Math.random() * 4) * 360;
    const nextRotation = rotation + spins;
    setRotation(nextRotation);

    setTimeout(() => {
      setIsFlipping(false);
      const chosen = isHeads ? 'A' : 'B';
      setResult(chosen);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Sigmund Freud's Decision Hack
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">The Subconscious Coin Flip</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            When you flip a coin, you don't do it to let fate decide. You do it because while the coin is in the air, you suddenly know what you are hoping for.
          </p>
        </div>

        {/* Option Mapping */}
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto text-xs">
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50 text-indigo-200">
            <span className="font-mono text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">HEADS</span>
            <span className="font-bold line-clamp-1">{optionA}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/50 text-amber-200">
            <span className="font-mono text-[10px] uppercase font-bold text-amber-400 block mb-0.5">TAILS</span>
            <span className="font-bold line-clamp-1">{optionB}</span>
          </div>
        </div>

        {/* 3D Coin Animation */}
        <div className="py-6 flex justify-center items-center perspective-1000">
          <div
            className={`w-32 h-32 rounded-full relative transition-transform duration-[1800ms] ease-out shadow-2xl flex items-center justify-center font-black text-xl cursor-pointer select-none ring-4 ring-amber-400/30 ${
              isFlipping ? 'animate-bounce' : ''
            }`}
            style={{
              transform: `rotateY(${rotation}deg)`,
              transformStyle: 'preserve-3d',
              background: 'radial-gradient(circle at 35% 35%, #fde047 0%, #ca8a04 60%, #854d0e 100%)',
            }}
            onClick={flipCoin}
          >
            <div className="flex flex-col items-center justify-center text-amber-950">
              <span className="text-3xl">🪙</span>
              <span className="text-[10px] font-mono tracking-widest uppercase mt-0.5 font-black">
                {isFlipping ? 'FLIPPING' : result ? (result === 'A' ? 'HEADS' : 'TAILS') : 'TAP FLIP'}
              </span>
            </div>
          </div>
        </div>

        {/* Flip CTA */}
        <div>
          <button
            onClick={flipCoin}
            disabled={isFlipping}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-amber-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
            {isFlipping ? 'Coin is in the air...' : 'Flip The Coin'}
          </button>
        </div>

        {/* Result & Emotional Debrief */}
        {result && (
          <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <span className="text-xs text-slate-400 block font-mono">The Coin Landed On:</span>
              <h4 className="text-lg font-extrabold text-white">
                {result === 'A' ? `Heads: ${optionA}` : `Tails: ${optionB}`}
              </h4>
            </div>

            {/* Involuntary reaction questionnaire */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-slate-200">
                In the exact split-second it landed, what was your visceral gut reaction?
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setUserReaction('relieved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    userReaction === 'relieved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  😌 Relief / Satisfaction
                </button>
                <button
                  onClick={() => setUserReaction('disappointed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    userReaction === 'disappointed'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  😔 Disappointment / Dread
                </button>
                <button
                  onClick={() => setUserReaction('neutral')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    userReaction === 'neutral'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  😐 Completely Indifferent
                </button>
              </div>

              {/* Psychology Interpretation */}
              {userReaction && (
                <div className="text-xs text-left p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed mt-2">
                  {userReaction === 'relieved' && (
                    <span className="text-emerald-300 font-medium">
                      🎯 <strong>Your gut confirms it:</strong> You genuinely desire{' '}
                      <span className="text-white font-bold">{result === 'A' ? optionA : optionB}</span>. Trust that feeling—it's your subconscious pattern-matching at work.
                    </span>
                  )}
                  {userReaction === 'disappointed' && (
                    <span className="text-rose-300 font-medium">
                      ⚡ <strong>The inversion test passed:</strong> Feeling disappointed proves you actually want{' '}
                      <span className="text-white font-bold">{result === 'A' ? optionB : optionA}</span>! Disregard the coin; pick the other one.
                    </span>
                  )}
                  {userReaction === 'neutral' && (
                    <span className="text-indigo-300 font-medium">
                      ⚖️ <strong>True equilibrium:</strong> You are equally comfortable with both outcomes. Let the rational Comparison Matrix weights and SWOT analysis break the tie.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
