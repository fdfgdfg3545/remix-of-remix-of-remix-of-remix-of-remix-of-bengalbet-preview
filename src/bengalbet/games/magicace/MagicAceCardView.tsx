// @ts-nocheck
import React from 'react';
import { MagicAceCard } from './magicAceTypes';
import { Lock, Sparkles, Crown, Zap } from 'lucide-react';

interface CardProps {
  card: MagicAceCard;
}

export const MagicAceCardView: React.FC<CardProps> = ({ card }) => {
  const { type, isGolden, isLocked, lockCount, isWinning } = card;

  // Wild Lock - Central Highlight Feature
  if (type === 'wild_lock') {
    return (
      <div
        className={`relative w-full h-full rounded-xl bg-gradient-to-b from-[#2a0e44] via-[#1a062d] to-[#0d0117] border-2 border-purple-400 p-1 flex flex-col items-center justify-between shadow-[0_0_20px_rgba(192,132,252,0.6)] transition-all ${
          isWinning ? 'scale-105 animate-pulse' : ''
        }`}
      >
        {/* Top Padlock Badge */}
        <div className="w-full flex items-center justify-between px-1">
          <div className="flex items-center gap-0.5 bg-purple-950/80 border border-purple-400/60 px-1 py-0.2 rounded text-[9px] font-black text-purple-300 font-game">
            <Lock className="w-2.5 h-2.5 text-yellow-300" />
            <span>LOCK</span>
          </div>
          {lockCount && lockCount > 1 && (
            <span className="text-[10px] font-black text-yellow-300 bg-yellow-500/30 px-1 rounded">
              x{lockCount}
            </span>
          )}
        </div>

        {/* Center Magician Ace Graphic */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-yellow-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg border border-yellow-200 animate-pulse">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="font-game text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-purple-200 to-pink-300 tracking-wider">
            WILD LOCK
          </span>
        </div>

        {/* Bottom Chain Bar */}
        <div className="w-full text-center text-[8px] sm:text-[9px] font-extrabold text-purple-200 bg-purple-900/60 rounded py-0.5 border border-purple-500/40">
          STICKY WILD
        </div>
      </div>
    );
  }

  // Regular Wild
  if (type === 'wild') {
    return (
      <div
        className={`relative w-full h-full rounded-xl bg-gradient-to-b from-[#380e2b] to-[#170311] border-2 border-pink-400 p-1 flex flex-col items-center justify-between shadow-[0_0_15px_rgba(244,114,182,0.5)] ${
          isWinning ? 'scale-105 animate-pulse' : ''
        }`}
      >
        <span className="text-[9px] font-bold text-pink-300 self-start">♠ WILD</span>
        <div className="my-auto flex flex-col items-center">
          <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300 fill-pink-400 animate-bounce" />
          <span className="font-game text-xs sm:text-sm font-black text-yellow-300 tracking-widest">
            MAGIC WILD
          </span>
        </div>
        <div className="text-[8px] text-pink-300 uppercase">SUBSTITUTE</div>
      </div>
    );
  }

  // Scatter
  if (type === 'scatter') {
    return (
      <div
        className={`relative w-full h-full rounded-xl bg-gradient-to-b from-[#2e1d03] to-[#120a00] border-2 border-amber-400 p-1 flex flex-col items-center justify-between shadow-[0_0_16px_rgba(245,158,11,0.6)] ${
          isWinning ? 'scale-105 animate-pulse' : ''
        }`}
      >
        <div className="flex items-center gap-1 self-start text-[9px] font-black text-yellow-300">
          <Sparkles className="w-2.5 h-2.5" /> SCATTER
        </div>
        <div className="my-auto flex flex-col items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-lg border border-white">
            <span className="text-base sm:text-lg">🎩</span>
          </div>
          <span className="font-game text-xs sm:text-sm font-black text-yellow-300 tracking-wider">
            FREE GAME
          </span>
        </div>
        <div className="text-[8px] text-yellow-200/80 font-bold">10 SPINS</div>
      </div>
    );
  }

  // Regular Cards: Ace, King, Queen, Jack, 10, 9
  const CARD_MAP = {
    ace_spades: { rank: 'A', suit: '♠', color: 'text-purple-300', bg: 'from-slate-900 via-indigo-950 to-slate-900', border: 'border-indigo-500/40' },
    king_hearts: { rank: 'K', suit: '♥', color: 'text-red-400', bg: 'from-red-950/80 via-slate-900 to-red-950/80', border: 'border-red-500/40' },
    queen_clubs: { rank: 'Q', suit: '♣', color: 'text-emerald-400', bg: 'from-emerald-950/80 via-slate-900 to-emerald-950/80', border: 'border-emerald-500/40' },
    jack_diamonds: { rank: 'J', suit: '♦', color: 'text-cyan-400', bg: 'from-cyan-950/80 via-slate-900 to-cyan-950/80', border: 'border-cyan-500/40' },
    ten: { rank: '10', suit: '♠', color: 'text-amber-300', bg: 'from-slate-900 to-slate-950', border: 'border-slate-700' },
    nine: { rank: '9', suit: '♥', color: 'text-rose-300', bg: 'from-slate-900 to-slate-950', border: 'border-slate-700' }
  };

  const item = CARD_MAP[type];

  return (
    <div
      className={`relative w-full h-full rounded-xl bg-gradient-to-b ${item.bg} border ${
        isGolden ? 'border-2 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : item.border
      } p-1 flex flex-col justify-between transition-all ${
        isWinning ? 'scale-105 brightness-125' : ''
      }`}
    >
      {/* Top Left Rank & Suit */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-0.5 font-game font-bold text-xs sm:text-sm ${item.color}`}>
          <span>{item.rank}</span>
          <span className="text-[10px]">{item.suit}</span>
        </div>
        {isGolden && (
          <span className="text-[8px] font-black text-amber-950 bg-yellow-400 px-1 rounded shadow">
            GOLD
          </span>
        )}
      </div>

      {/* Center Rank Big Emblem */}
      <div className="my-auto flex flex-col items-center justify-center">
        <span className={`font-game text-2xl sm:text-3xl font-black ${item.color} drop-shadow-md`}>
          {item.rank}
        </span>
        <span className={`text-xs ${item.color}`}>{item.suit}</span>
      </div>

      {/* Bottom Right Rank & Suit inverted */}
      <div className={`self-end flex items-center gap-0.5 font-game font-bold text-[10px] sm:text-xs ${item.color} rotate-180`}>
        <span>{item.rank}</span>
        <span>{item.suit}</span>
      </div>
    </div>
  );
};
