// @ts-nocheck
import React from 'react';
import { Crazy777SymbolType, Crazy777SpecialType } from './crazy777Types';
import { Sparkles, Zap, RotateCcw } from 'lucide-react';

interface RegularSymbolProps {
  type: Crazy777SymbolType;
  isCenter?: boolean;
  isWinning?: boolean;
  isSpinning?: boolean;
}

export const Crazy777RegularSymbolView: React.FC<RegularSymbolProps> = ({
  type,
  isCenter = false,
  isWinning = false,
  isSpinning = false
}) => {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center rounded-xl select-none transition-all duration-200 overflow-hidden ${
        isSpinning ? 'blur-[1.5px] opacity-70 scale-95' : 'blur-0 opacity-100 scale-100'
      } ${
        isWinning
          ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-red-950 scale-105 z-20 shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-pulse'
          : isCenter
          ? 'bg-gradient-to-b from-[#24060d] via-[#150207] to-[#0d0104] border border-amber-500/30'
          : 'bg-black/40 border border-white/5 opacity-50 scale-90'
      }`}
    >
      {type === 'triple_7' && (
        <div className="flex flex-col items-center">
          <div className="flex items-center -space-x-1">
            <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-red-500 to-rose-700 drop-shadow-[0_2px_8px_rgba(239,68,68,0.9)]">
              7
            </span>
            <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-red-400 to-rose-600 drop-shadow-[0_2px_12px_rgba(239,68,68,1)] z-10 scale-110">
              7
            </span>
            <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-red-500 to-rose-700 drop-shadow-[0_2px_8px_rgba(239,68,68,0.9)]">
              7
            </span>
          </div>
          <span className="text-[9px] font-black text-yellow-400 tracking-widest uppercase mt-0.5">
            CRAZY 777
          </span>
        </div>
      )}

      {type === 'double_7' && (
        <div className="flex items-center -space-x-1">
          <span className="text-3xl md:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-500 to-amber-700 drop-shadow-[0_2px_8px_rgba(249,115,22,0.8)]">
            7
          </span>
          <span className="text-3xl md:text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-500 to-amber-700 drop-shadow-[0_2px_8px_rgba(249,115,22,0.8)]">
            7
          </span>
        </div>
      )}

      {type === 'single_7' && (
        <span className="text-4xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-blue-500 to-indigo-700 drop-shadow-[0_2px_10px_rgba(59,130,246,0.8)]">
          7
        </span>
      )}

      {type === 'bell' && (
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl filter drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
            🔔
          </span>
        </div>
      )}

      {type === 'triple_bar' && (
        <div className="flex flex-col gap-0.5 items-center">
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded shadow border border-red-300">
            BAR
          </div>
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded shadow border border-red-300">
            BAR
          </div>
          <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-[10px] px-3 py-0.5 rounded shadow border border-red-300">
            BAR
          </div>
        </div>
      )}

      {type === 'double_bar' && (
        <div className="flex flex-col gap-1 items-center">
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white font-black text-[11px] px-3.5 py-0.5 rounded shadow border border-blue-300">
            BAR
          </div>
          <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white font-black text-[11px] px-3.5 py-0.5 rounded shadow border border-blue-300">
            BAR
          </div>
        </div>
      )}

      {type === 'single_bar' && (
        <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white font-black text-xs px-4 py-1 rounded shadow border border-emerald-300">
          BAR
        </div>
      )}

      {type === 'blank' && (
        <div className="w-4 h-0.5 bg-zinc-700/60 rounded-full" />
      )}
    </div>
  );
};

interface SpecialSymbolProps {
  type: Crazy777SpecialType;
  isCenter?: boolean;
  isWinning?: boolean;
  isSpinning?: boolean;
}

export const Crazy777SpecialSymbolView: React.FC<SpecialSymbolProps> = ({
  type,
  isCenter = false,
  isWinning = false,
  isSpinning = false
}) => {
  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center rounded-xl select-none transition-all duration-200 overflow-hidden ${
        isSpinning ? 'blur-[1.5px] opacity-70 scale-95' : 'blur-0 opacity-100 scale-100'
      } ${
        isWinning
          ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-red-950 scale-105 z-20 shadow-[0_0_30px_rgba(250,204,21,1)] bg-gradient-to-b from-yellow-500 via-amber-600 to-amber-900 border-2 border-yellow-300 animate-pulse'
          : isCenter
          ? 'bg-gradient-to-b from-[#3a0815] via-[#20030a] to-[#120105] border-2 border-yellow-500/60 shadow-[inset_0_0_15px_rgba(250,204,21,0.2)]'
          : 'bg-black/50 border border-yellow-500/20 opacity-40 scale-90'
      }`}
    >
      {type === 'mult_2x' && (
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-500 drop-shadow-[0_2px_8px_rgba(250,204,21,0.9)]">
            2X
          </span>
          <span className="text-[9px] font-black text-yellow-300 uppercase tracking-wider">
            MULTIPLIER
          </span>
        </div>
      )}

      {type === 'mult_5x' && (
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-amber-600 drop-shadow-[0_2px_10px_rgba(249,115,22,0.9)]">
            5X
          </span>
          <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">
            MULTIPLIER
          </span>
        </div>
      )}

      {type === 'mult_10x' && (
        <div className="flex flex-col items-center">
          <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-red-500 to-yellow-400 drop-shadow-[0_2px_12px_rgba(239,68,68,1)] animate-bounce">
            10X
          </span>
          <span className="text-[9px] font-black text-yellow-300 uppercase tracking-wider">
            SUPER MULTIPLIER
          </span>
        </div>
      )}

      {type === 'bonus_cash_1' && (
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl md:text-3xl font-black text-emerald-400 drop-shadow">
            +5X
          </span>
          <span className="text-[9px] font-bold text-emerald-300 uppercase">
            BONUS CASH
          </span>
        </div>
      )}

      {type === 'bonus_cash_2' && (
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl md:text-3xl font-black text-emerald-300 drop-shadow">
            +20X
          </span>
          <span className="text-[9px] font-bold text-emerald-200 uppercase">
            SUPER CASH
          </span>
        </div>
      )}

      {type === 'bonus_cash_3' && (
        <div className="flex flex-col items-center text-center">
          <span className="text-2xl md:text-3xl font-black text-yellow-300 drop-shadow animate-pulse">
            +50X
          </span>
          <span className="text-[9px] font-black text-yellow-200 uppercase">
            MEGA CASH
          </span>
        </div>
      )}

      {type === 'respin_1' && (
        <div className="flex flex-col items-center">
          <RotateCcw className="w-7 h-7 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-black text-cyan-300 mt-1 uppercase">
            1 RESPIN
          </span>
        </div>
      )}

      {type === 'respin_2' && (
        <div className="flex flex-col items-center">
          <RotateCcw className="w-7 h-7 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span className="text-xs font-black text-indigo-300 mt-1 uppercase">
            2 RESPINS
          </span>
        </div>
      )}

      {type === 'respin_5' && (
        <div className="flex flex-col items-center">
          <div className="relative">
            <RotateCcw className="w-8 h-8 text-yellow-300 animate-spin" style={{ animationDuration: '2s' }} />
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 absolute -top-1 -right-1" />
          </div>
          <span className="text-xs font-black text-yellow-300 mt-1 uppercase animate-pulse">
            5 RESPINS!
          </span>
        </div>
      )}

      {type === 'blank' && (
        <div className="w-4 h-0.5 bg-zinc-700/60 rounded-full" />
      )}
    </div>
  );
};
