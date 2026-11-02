// @ts-nocheck
import React from 'react';
import { AlibabaCell, ALIBABA_SYMBOLS } from './alibabaTypes';
import { Sparkles, Crown, Flame, Gem, Compass, Shield, Key } from 'lucide-react';

interface AlibabaSymbolViewProps {
  cell: AlibabaCell;
  isWinning?: boolean;
  isSpinning?: boolean;
}

export const AlibabaSymbolView: React.FC<AlibabaSymbolViewProps> = ({
  cell,
  isWinning = false,
  isSpinning = false
}) => {
  const config = ALIBABA_SYMBOLS[cell.type] || ALIBABA_SYMBOLS.ace;

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center rounded-xl select-none transition-all duration-300 overflow-hidden ${
        isSpinning ? 'blur-[1.5px] opacity-75 scale-95' : 'blur-0 opacity-100 scale-100'
      } ${
        isWinning
          ? 'ring-2 ring-yellow-300 ring-offset-1 ring-offset-amber-950 scale-105 z-20 shadow-[0_0_20px_rgba(251,191,36,0.85)] animate-pulse'
          : 'hover:brightness-110 shadow-inner'
      } ${
        cell.type === 'wild'
          ? 'bg-gradient-to-b from-amber-600/90 via-yellow-700/80 to-amber-950 border border-amber-300/80'
          : cell.type === 'scatter'
          ? 'bg-gradient-to-b from-amber-500/90 via-red-900/80 to-amber-950 border border-yellow-400'
          : cell.type === 'cave_bonus'
          ? 'bg-gradient-to-b from-purple-700/90 via-indigo-900/80 to-slate-950 border border-purple-400'
          : 'bg-gradient-to-b from-[#1c1836] via-[#120e29] to-[#0a0718] border border-amber-500/20'
      }`}
    >
      {/* Decorative Persian corner trims */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-amber-400/40 rounded-tl" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-amber-400/40 rounded-tr" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-amber-400/40 rounded-bl" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-amber-400/40 rounded-br" />

      {/* Symbol Graphics */}
      {cell.type === 'alibaba' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border border-yellow-200 shadow-md">
            {/* Turban & Dagger character */}
            <span className="text-2xl filter drop-shadow">👳‍♂️</span>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-[9px] font-black px-1 rounded text-white border border-yellow-300">
              HERO
            </div>
          </div>
          <span className="text-[10px] font-black tracking-wider text-amber-300 mt-1 uppercase drop-shadow">
            Ali Baba
          </span>
        </div>
      )}

      {cell.type === 'morgiana' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 border border-pink-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🧕</span>
            <div className="absolute -top-1 -right-1">
              <Crown className="w-3.5 h-3.5 text-yellow-300 drop-shadow" />
            </div>
          </div>
          <span className="text-[10px] font-black tracking-wider text-pink-300 mt-1 uppercase drop-shadow">
            Morgiana
          </span>
        </div>
      )}

      {cell.type === 'treasure_chest' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-tr from-yellow-600 to-amber-400 border border-yellow-200 shadow-md">
            <span className="text-2xl filter drop-shadow">💎</span>
            <div className="absolute -top-1 -left-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-100 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <span className="text-[10px] font-black tracking-wider text-yellow-300 mt-1 uppercase drop-shadow">
            Chest
          </span>
        </div>
      )}

      {cell.type === 'magic_carpet' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-400 border border-purple-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🧞</span>
          </div>
          <span className="text-[10px] font-black tracking-wider text-purple-300 mt-1 uppercase drop-shadow">
            Carpet
          </span>
        </div>
      )}

      {cell.type === 'scimitar' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 border border-emerald-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🗡️</span>
          </div>
          <span className="text-[10px] font-black tracking-wider text-emerald-300 mt-1 uppercase drop-shadow">
            Scimitar
          </span>
        </div>
      )}

      {cell.type === 'wild' && (
        <div className="flex flex-col items-center justify-center p-1 relative">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse">
            <span className="text-2xl filter drop-shadow">🪔</span>
            <div className="absolute -top-1 -right-1">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-bounce" />
            </div>
          </div>
          <div className="bg-amber-950/90 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-400 mt-1 tracking-wider shadow">
            WILD
          </div>
        </div>
      )}

      {cell.type === 'scatter' && (
        <div className="flex flex-col items-center justify-center p-1 relative">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-b from-amber-400 via-red-600 to-amber-900 border-2 border-yellow-300 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-pulse">
            <span className="text-2xl filter drop-shadow">🚪</span>
            <div className="absolute -bottom-1 -right-1">
              <Key className="w-4 h-4 text-yellow-200 fill-yellow-200" />
            </div>
          </div>
          <div className="bg-red-950/90 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-yellow-400 mt-1 tracking-wider shadow">
            SCATTER
          </div>
        </div>
      )}

      {cell.type === 'cave_bonus' && (
        <div className="flex flex-col items-center justify-center p-1 relative">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-b from-purple-400 via-indigo-600 to-purple-950 border-2 border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-bounce">
            <span className="text-2xl filter drop-shadow">🏺</span>
          </div>
          <div className="bg-indigo-950/90 text-purple-200 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-purple-400 mt-1 tracking-wider shadow">
            BONUS
          </div>
        </div>
      )}

      {/* Royal Card Symbols */}
      {['ace', 'king', 'queen', 'jack', 'ten'].includes(cell.type) && (
        <div className="flex flex-col items-center justify-center">
          <span
            className="text-2xl font-black font-serif drop-shadow"
            style={{ color: config.color, textShadow: `0 0 10px ${config.glowColor}` }}
          >
            {config.nameEn}
          </span>
          <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: config.color }} />
        </div>
      )}
    </div>
  );
};
