// @ts-nocheck
import React from 'react';
import { MultiplierReelItem } from './fortuneGemsTypes';

interface FortuneMultiplierReelProps {
  items: MultiplierReelItem[];
  isSpinning: boolean;
  extraBet: boolean;
  language: 'en' | 'bn';
}

export const FortuneMultiplierReel: React.FC<FortuneMultiplierReelProps> = ({
  items,
  isSpinning,
  extraBet,
  language
}) => {
  const activeItem = items[1] || { type: 'multiplier', value: 1 };

  return (
    <div className="flex flex-col items-center h-full w-20 sm:w-24 bg-gradient-to-b from-[#21162d] via-[#160d21] to-[#0d0714] border-2 border-yellow-600/70 rounded-xl p-1 relative shadow-[0_0_20px_rgba(202,138,4,0.3)] select-none">
      {/* Header Tag */}
      <div className="w-full py-1 text-center bg-gradient-to-r from-amber-600 to-yellow-500 rounded-t-lg border-b border-yellow-300 shadow">
        <span className="text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wider block">
          {language === 'bn' ? 'গুণক রিল' : 'MULTIPLIER'}
        </span>
        {extraBet && (
          <span className="text-[7.5px] font-black text-red-950 bg-yellow-300 px-1 rounded-full uppercase tracking-tighter inline-block">
            {language === 'bn' ? '১x বাদ' : 'NO 1X'}
          </span>
        )}
      </div>

      {/* Reel track */}
      <div className="relative flex-1 w-full flex flex-col justify-between py-1 overflow-hidden">
        {/* Center active target marker frame */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[34%] border-2 border-yellow-300 bg-gradient-to-r from-yellow-500/20 via-amber-400/30 to-yellow-500/20 rounded-lg pointer-events-none z-20 shadow-[0_0_15px_rgba(250,204,21,0.6)]">
          {/* Left Pointer Arrow */}
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-yellow-300 animate-pulse" />
          {/* Right Pointer Arrow */}
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-yellow-300 animate-pulse" />
        </div>

        {/* 3 Positions on Reel */}
        {items.map((item, idx) => {
          const isCenter = idx === 1;

          return (
            <div
              key={idx}
              className={`flex-1 flex items-center justify-center transition-all duration-200 relative ${
                isCenter ? 'z-10 scale-105' : 'opacity-40 scale-90'
              } ${isSpinning ? 'blur-[1.5px]' : ''}`}
            >
              {item.type === 'multiplier' ? (
                <div
                  className={`flex flex-col items-center justify-center w-full h-full rounded-md border ${
                    isCenter
                      ? 'bg-gradient-to-b from-amber-500/30 to-yellow-600/40 border-yellow-400'
                      : 'bg-black/40 border-amber-900/30'
                  }`}
                >
                  <span
                    className={`font-black tracking-tight ${
                      isCenter
                        ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-amber-400 text-xl sm:text-2xl drop-shadow-[0_2px_6px_rgba(245,158,11,0.8)]'
                        : 'text-amber-300/60 text-sm'
                    }`}
                  >
                    {item.value}X
                  </span>
                  {isCenter && (
                    <span className="text-[8px] font-bold text-yellow-300/80 -mt-0.5">
                      {language === 'bn' ? 'গুণক' : 'BOOST'}
                    </span>
                  )}
                </div>
              ) : (
                /* Wheel Bonus item */
                <div
                  className={`flex flex-col items-center justify-center w-full h-full rounded-md border ${
                    isCenter
                      ? 'bg-gradient-to-b from-rose-600/40 via-amber-500/40 to-purple-600/40 border-yellow-300 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                      : 'bg-black/40 border-rose-900/30'
                  }`}
                >
                  <span className="text-xl sm:text-2xl">🎡</span>
                  <span
                    className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
                      isCenter ? 'text-yellow-300' : 'text-zinc-400'
                    }`}
                  >
                    {language === 'bn' ? 'হুইল' : 'WHEEL'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Details */}
      <div className="w-full py-0.5 text-center bg-black/60 rounded-b-lg border-t border-amber-900/40">
        <span className="text-[8px] text-amber-300/80 font-mono">
          {activeItem.type === 'multiplier' ? `${activeItem.value}X` : 'BONUS'}
        </span>
      </div>
    </div>
  );
};
