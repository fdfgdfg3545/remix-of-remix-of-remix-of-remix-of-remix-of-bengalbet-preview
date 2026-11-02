// @ts-nocheck
import React from 'react';
import { SevenCoinsSymbolType, JackpotTier } from './sevenCoinsTypes';
import { Sparkles, Coins } from 'lucide-react';

interface SymbolProps {
  type: SevenCoinsSymbolType;
  coinValue?: number;
  jackpotTier?: JackpotTier;
  isWinning?: boolean;
  isSpinning?: boolean;
  betAmount?: number;
}

export const SevenCoinsSymbolView: React.FC<SymbolProps> = ({
  type,
  coinValue,
  jackpotTier,
  isWinning = false,
  isSpinning = false,
  betAmount = 20
}) => {
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center rounded-xl select-none transition-all duration-200 overflow-hidden ${
        isSpinning ? 'blur-[1.5px] opacity-70 scale-95' : 'blur-0 opacity-100 scale-100'
      } ${
        isWinning
          ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-950 scale-105 z-20 shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-pulse bg-gradient-to-b from-amber-500/20 to-yellow-500/10'
          : 'bg-gradient-to-b from-[#1c1f2e] via-[#11131c] to-[#0b0d13] border border-yellow-500/20 shadow-inner'
      }`}
    >
      {type === 'seven' && (
        <div className="flex items-center -space-x-1.5">
          <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-red-500 to-rose-700 drop-shadow-[0_2px_8px_rgba(239,68,68,0.9)]">
            7
          </span>
          <span className="text-4xl sm:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-red-400 to-rose-600 drop-shadow-[0_2px_12px_rgba(239,68,68,1)] scale-110 z-10">
            7
          </span>
          <span className="text-3xl sm:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-red-500 to-rose-700 drop-shadow-[0_2px_8px_rgba(239,68,68,0.9)]">
            7
          </span>
        </div>
      )}

      {type === 'bell' && (
        <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
          🔔
        </span>
      )}

      {type === 'bar' && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-sm px-4 py-1 rounded shadow-md border border-yellow-200">
          BAR
        </div>
      )}

      {type === 'watermelon' && (
        <span className="text-3xl sm:text-4xl">🍉</span>
      )}

      {type === 'grapes' && (
        <span className="text-3xl sm:text-4xl">🍇</span>
      )}

      {type === 'plum' && (
        <span className="text-3xl sm:text-4xl">🫐</span>
      )}

      {type === 'orange' && (
        <span className="text-3xl sm:text-4xl">🍊</span>
      )}

      {type === 'cherry' && (
        <span className="text-3xl sm:text-4xl">🍒</span>
      )}

      {/* Bonus Gold Coin */}
      {type === 'bonus_coin' && (
        <div className="relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-2 border-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse">
          <div className="absolute inset-1 rounded-full border border-dashed border-amber-800/40 flex flex-col items-center justify-center">
            {jackpotTier ? (
              <>
                <span className="text-[10px] font-black uppercase text-amber-950 tracking-wider">
                  {jackpotTier}
                </span>
                <span className="text-xs font-black text-red-900 drop-shadow">
                  {jackpotTier === 'major' ? '150X' : jackpotTier === 'minor' ? '50X' : '25X'}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs sm:text-sm font-black text-amber-950 drop-shadow">
                  {coinValue ? `${coinValue}X` : 'BONUS'}
                </span>
                <span className="text-[8px] font-bold text-amber-900">
                  ৳{(betAmount * (coinValue || 1)).toFixed(0)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collect Coin (Special Magnet Coin) */}
      {type === 'collect_coin' && (
        <div className="relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-300 border-2 border-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.9)] animate-pulse">
          <div className="absolute inset-1 rounded-full border border-dashed border-cyan-100/50 flex flex-col items-center justify-center">
            <Coins className="w-4 h-4 text-white" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest mt-0.5">
              COLLECT
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
