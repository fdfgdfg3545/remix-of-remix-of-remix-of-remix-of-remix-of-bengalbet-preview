// @ts-nocheck
import React from 'react';
import { MoneyComingNumber, MoneyComingSpecial } from './moneyComingTypes';
import { RotateCcw, Sparkles, Disc } from 'lucide-react';

interface NumberProps {
  value: MoneyComingNumber;
  isPayline?: boolean;
  isWin?: boolean;
}

export const MoneyComingNumberView: React.FC<NumberProps> = ({ value, isPayline, isWin }) => {
  if (value === 'blank') {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-30 select-none">
        <div className="w-8 h-1.5 bg-yellow-600/40 rounded-full" />
      </div>
    );
  }

  // Styling based on number value
  let gradient = 'from-amber-300 via-yellow-400 to-amber-600';
  let shadowColor = 'rgba(245, 158, 11, 0.4)';
  let textSize = 'text-3xl sm:text-4xl md:text-5xl';

  if (value === '100' || value === '10') {
    gradient = 'from-yellow-200 via-amber-300 to-yellow-600';
    shadowColor = 'rgba(234, 179, 8, 0.6)';
    textSize = value === '100' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl';
  } else if (value === '00') {
    gradient = 'from-emerald-300 via-teal-400 to-emerald-600';
    shadowColor = 'rgba(16, 185, 129, 0.4)';
    textSize = 'text-3xl sm:text-4xl md:text-5xl';
  } else if (value === '5') {
    gradient = 'from-rose-300 via-red-500 to-rose-700';
    shadowColor = 'rgba(239, 68, 68, 0.5)';
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center font-black select-none transition-transform duration-300 ${
        isWin ? 'scale-110 animate-pulse' : ''
      }`}
    >
      <div
        className={`font-game tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-b ${gradient} ${textSize} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
        style={{
          filter: isWin
            ? `drop-shadow(0 0 16px ${shadowColor}) drop-shadow(0 0 24px rgba(255,215,0,0.8))`
            : `drop-shadow(0 2px 4px rgba(0,0,0,0.8))`
        }}
      >
        {value}
      </div>
    </div>
  );
};

interface SpecialProps {
  value: MoneyComingSpecial;
  isPayline?: boolean;
  isWin?: boolean;
}

export const MoneyComingSpecialView: React.FC<SpecialProps> = ({ value, isPayline, isWin }) => {
  if (value === 'blank') {
    return (
      <div className="w-full h-full flex items-center justify-center opacity-30 select-none">
        <div className="w-6 h-6 rounded-full border border-yellow-500/30 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
        </div>
      </div>
    );
  }

  if (value === 'wheel_bonus') {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center select-none ${isWin ? 'scale-110 animate-bounce' : ''}`}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-orange-500 border-2 border-yellow-200 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-spin-slow">
          <Disc className="w-7 h-7 text-amber-950" />
        </div>
        <span className="text-[10px] sm:text-xs font-black uppercase text-yellow-300 tracking-wider font-game mt-0.5">
          SUPER WHEEL
        </span>
      </div>
    );
  }

  if (value === 'respin') {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center select-none ${isWin ? 'scale-110 animate-pulse' : ''}`}>
        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 border-2 border-cyan-200 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.7)]">
          <RotateCcw className="w-6 h-6 text-white animate-spin-slow" />
        </div>
        <span className="text-[10px] sm:text-xs font-black uppercase text-cyan-300 tracking-wider font-game mt-0.5">
          FREE RESPIN
        </span>
      </div>
    );
  }

  // Multipliers: 2X, 5X, 10X
  const multMap = {
    mult_2x: { label: '2X', color: 'from-amber-400 to-yellow-600', border: 'border-yellow-400' },
    mult_5x: { label: '5X', color: 'from-orange-500 to-red-600', border: 'border-orange-400' },
    mult_10x: { label: '10X', color: 'from-purple-500 to-pink-600', border: 'border-pink-400' }
  };

  const item = multMap[value];

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center select-none ${isWin ? 'scale-110 animate-pulse' : ''}`}>
      <div className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-b ${item.color} border-2 ${item.border} shadow-[0_0_18px_rgba(255,215,0,0.5)] flex items-center justify-center`}>
        <span className="font-game text-xl sm:text-2xl font-black text-white tracking-widest drop-shadow-md">
          {item.label}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold text-yellow-200 uppercase tracking-tighter mt-0.5">
        MULTIPLIER
      </span>
    </div>
  );
};
