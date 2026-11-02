// @ts-nocheck
import React, { useEffect } from 'react';
import { Sparkles, Zap, Trophy, Flame, Atom } from 'lucide-react';

interface SuperElementsWinOverlayProps {
  amount: number;
  betAmount: number;
  language: 'en' | 'bn';
  onDismiss: () => void;
}

export const SuperElementsWinOverlay: React.FC<SuperElementsWinOverlayProps> = ({
  amount,
  betAmount,
  language,
  onDismiss
}) => {
  const isBn = language === 'bn';
  const ratio = amount / Math.max(1, betAmount);

  let titleEn = 'BIG WIN!';
  let titleBn = 'বিগ উইন!';
  let colorClass = 'from-amber-400 via-yellow-300 to-amber-500';
  let glowClass = 'rgba(245, 158, 11, 0.8)';

  if (ratio >= 40) {
    titleEn = 'SUPER ELEMENTAL WIN!';
    titleBn = 'সুপার এলিমেন্টাল উইন!';
    colorClass = 'from-rose-500 via-amber-300 to-cyan-400';
    glowClass = 'rgba(244, 63, 94, 0.9)';
  } else if (ratio >= 20) {
    titleEn = 'MEGA WIN!';
    titleBn = 'মেগা উইন!';
    colorClass = 'from-cyan-400 via-teal-300 to-amber-400';
    glowClass = 'rgba(6, 182, 212, 0.9)';
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="relative flex flex-col items-center text-center p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-cyan-400/50 shadow-[0_0_80px_rgba(6,182,212,0.6)] max-w-md w-full">
        {/* Floating Sparks */}
        <div className="absolute -top-6 flex items-center justify-center">
          <div className="p-4 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 shadow-[0_0_30px_rgba(245,158,11,1)] animate-bounce">
            <Atom className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
            FA CHAI • SUPER ELEMENTS 2
          </p>
          <h2 
            className={`text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${colorClass} tracking-tight drop-shadow-[0_0_20px_${glowClass}]`}
          >
            {isBn ? titleBn : titleEn}
          </h2>
        </div>

        {/* Win Amount */}
        <div className="my-6 p-4 rounded-2xl bg-black/60 border border-amber-400/40 w-full shadow-inner">
          <div className="text-3xl md:text-5xl font-black font-mono text-amber-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
            ৳{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            {ratio.toFixed(1)}x {isBn ? 'বেট মাল্টিপ্লায়ার' : 'Bet Multiplier'}
          </div>
        </div>

        <p className="text-xs text-slate-400 animate-pulse">
          {isBn ? 'স্ক্রিনে ট্যাপ করে খেলা চালিয়ে যান' : 'Tap anywhere to continue'}
        </p>
      </div>
    </div>
  );
};
