// @ts-nocheck
import React from 'react';
import { FortuneTreeCell, FORTUNE_TREE_SYMBOLS } from './fortuneTreeTypes';
import { Sparkles, Flame } from 'lucide-react';

interface FortuneTreeSymbolViewProps {
  cell: FortuneTreeCell;
  isWinning?: boolean;
  isSpinning?: boolean;
}

export const FortuneTreeSymbolView: React.FC<FortuneTreeSymbolViewProps> = ({
  cell,
  isWinning = false,
  isSpinning = false
}) => {
  const config = FORTUNE_TREE_SYMBOLS[cell.type] || FORTUNE_TREE_SYMBOLS.ace;

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center rounded-xl select-none transition-all duration-300 overflow-hidden ${
        isSpinning ? 'blur-[1.5px] opacity-75 scale-95' : 'blur-0 opacity-100 scale-100'
      } ${
        isWinning
          ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-red-950 scale-105 z-20 shadow-[0_0_20px_rgba(250,204,21,0.9)] animate-pulse'
          : 'hover:brightness-110 shadow-inner'
      } ${
        cell.type === 'golden_tree'
          ? 'bg-gradient-to-b from-amber-500 via-yellow-600 to-amber-950 border-2 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
          : cell.type === 'scatter'
          ? 'bg-gradient-to-b from-yellow-500 via-red-800 to-amber-950 border-2 border-yellow-400'
          : cell.type === 'red_packet'
          ? 'bg-gradient-to-b from-red-600 via-rose-800 to-red-950 border border-yellow-400'
          : 'bg-gradient-to-b from-[#2d0a14] via-[#1b050c] to-[#0d0206] border border-amber-500/25'
      }`}
    >
      {/* Corner gold trims */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-yellow-400/40 rounded-tl" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-yellow-400/40 rounded-tr" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-yellow-400/40 rounded-bl" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-yellow-400/40 rounded-br" />

      {/* Multiplier Badge (if tree dropped multiplier wild) */}
      {cell.multiplier && cell.multiplier > 1 && (
        <div className="absolute top-1 right-1 z-20 bg-gradient-to-r from-red-600 to-amber-500 text-yellow-100 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-yellow-200 shadow animate-bounce">
          {cell.multiplier}X
        </div>
      )}

      {/* Symbol Graphics */}
      {cell.type === 'golden_tree' && (
        <div className="flex flex-col items-center justify-center p-1 relative">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 border border-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse">
            <span className="text-3xl filter drop-shadow">🌳</span>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-4 h-4 text-yellow-100 fill-yellow-100 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div className="bg-amber-950/90 text-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-yellow-400 mt-1 tracking-wider shadow">
            WILD
          </div>
        </div>
      )}

      {cell.type === 'jin_chan' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-yellow-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🐸</span>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-[9px] font-black px-1 rounded text-white border border-yellow-300">
              🪙
            </div>
          </div>
          <span className="text-[10px] font-black tracking-wider text-amber-300 mt-1 uppercase drop-shadow">
            Jin Chan
          </span>
        </div>
      )}

      {cell.type === 'sycee' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-400 border border-yellow-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🟡</span>
          </div>
          <span className="text-[10px] font-black tracking-wider text-yellow-300 mt-1 uppercase drop-shadow">
            Sycee
          </span>
        </div>
      )}

      {cell.type === 'jade_carp' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 border border-emerald-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🐟</span>
          </div>
          <span className="text-[10px] font-black tracking-wider text-emerald-300 mt-1 uppercase drop-shadow">
            Jade Koi
          </span>
        </div>
      )}

      {cell.type === 'red_lantern' && (
        <div className="flex flex-col items-center justify-center p-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-rose-400 border border-red-200 shadow-md">
            <span className="text-2xl filter drop-shadow">🏮</span>
          </div>
          <span className="text-[10px] font-black tracking-wider text-red-300 mt-1 uppercase drop-shadow">
            Lantern
          </span>
        </div>
      )}

      {cell.type === 'scatter' && (
        <div className="flex flex-col items-center justify-center p-1 relative">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-b from-yellow-400 via-amber-600 to-amber-900 border-2 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.85)] animate-pulse">
            <span className="text-2xl filter drop-shadow">🏺</span>
          </div>
          <div className="bg-red-950/90 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-yellow-400 mt-1 tracking-wider shadow">
            BONUS
          </div>
        </div>
      )}

      {cell.type === 'red_packet' && (
        <div className="flex flex-col items-center justify-center p-1 relative">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-b from-red-500 via-rose-600 to-red-950 border-2 border-yellow-400 shadow-[0_0_15px_rgba(220,38,38,0.85)] animate-bounce">
            <span className="text-2xl filter drop-shadow">🧧</span>
          </div>
          <div className="bg-red-950/90 text-yellow-200 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-yellow-400 mt-1 tracking-wider shadow">
            HONGBAO
          </div>
        </div>
      )}

      {/* Royal Card Symbols */}
      {['ace', 'king', 'queen', 'jack'].includes(cell.type) && (
        <div className="flex flex-col items-center justify-center">
          <span
            className="text-2xl md:text-3xl font-black font-serif drop-shadow"
            style={{ color: config.color, textShadow: `0 0 10px ${config.glowColor}` }}
          >
            {config.nameEn}
          </span>
          <div className="w-5 h-0.5 rounded-full mt-0.5" style={{ backgroundColor: config.color }} />
        </div>
      )}
    </div>
  );
};
