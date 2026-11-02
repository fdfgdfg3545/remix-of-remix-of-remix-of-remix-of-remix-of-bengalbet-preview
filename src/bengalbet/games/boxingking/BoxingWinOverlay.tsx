// @ts-nocheck
import React, { useEffect } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { boxingKingAudio } from './boxingKingAudio';

interface BoxingWinOverlayProps {
  amount: number;
  betAmount: number;
  language: 'en' | 'bn';
  onClose: () => void;
}

export const BoxingWinOverlay: React.FC<BoxingWinOverlayProps> = ({
  amount,
  betAmount,
  language,
  onClose
}) => {
  const isBn = language === 'bn';
  const ratio = amount / Math.max(betAmount, 1);

  const tier: 'big' | 'mega' | 'super' = 
    ratio >= 100 ? 'super' : ratio >= 40 ? 'mega' : 'big';

  const title = tier === 'super'
    ? (isBn ? '🥊 নকআউট সুপার জয়! 🥊' : '🥊 KNOCKOUT SUPER WIN! 🥊')
    : tier === 'mega'
    ? (isBn ? '🔥 মেগা চ্যাম্পিয়ন জয়! 🔥' : '🔥 MEGA CHAMPION WIN! 🔥')
    : (isBn ? '⭐ বিগ উইন! ⭐' : '⭐ BIG WIN! ⭐');

  useEffect(() => {
    boxingKingAudio.playChampionshipCelebration(tier);
  }, [tier]);

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in cursor-pointer select-none"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md p-6 bg-gradient-to-b from-[#2a0808] via-[#150a1b] to-black rounded-3xl border-4 border-yellow-400 shadow-[0_0_60px_rgba(239,68,68,0.9)] text-center text-white overflow-hidden animate-bounce-short"
      >
        {/* Championship Belt Graphic */}
        <div className="flex justify-center mb-3">
          <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-600 via-amber-300 to-yellow-500 p-2 shadow-2xl border-4 border-white animate-spin-slow">
            <Trophy className="w-16 h-16 text-yellow-950 drop-shadow" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 tracking-wider mb-2 drop-shadow">
          {title}
        </h2>

        {/* Amount Won */}
        <div className="my-4 py-3 px-4 bg-black/60 rounded-2xl border border-yellow-500/50">
          <span className="text-xs text-yellow-300 font-bold uppercase tracking-widest block mb-1">
            {isBn ? 'মোট পুরষ্কার' : 'TOTAL PAYOUT'}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-yellow-400 font-mono tracking-tight drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
            ৳{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          {ratio.toFixed(1)}x {isBn ? 'বাজির গুণক জয়!' : 'Bet Multiplier Win!'}
        </p>

        {/* Collect Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-base rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.8)] transition transform active:scale-95 uppercase tracking-wider"
        >
          {isBn ? 'সংগ্রহ করুন ➔' : 'COLLECT WIN ➔'}
        </button>
      </div>
    </div>
  );
};
