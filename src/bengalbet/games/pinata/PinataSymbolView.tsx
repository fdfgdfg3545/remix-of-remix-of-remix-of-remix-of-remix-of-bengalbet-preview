// @ts-nocheck
import React from 'react';
import { PinataSymbolType, PINATA_SYMBOLS_META } from './pinataTypes';
import { Sparkles, Star, Music, PartyPopper } from 'lucide-react';

interface PinataSymbolViewProps {
  type: PinataSymbolType;
  isGoldFramed?: boolean;
  pinataMultiplier?: number;
  winHighlight?: boolean;
}

export const PinataSymbolView: React.FC<PinataSymbolViewProps> = ({
  type,
  isGoldFramed = false,
  pinataMultiplier,
  winHighlight = false
}) => {
  const meta = PINATA_SYMBOLS_META[type];

  const renderIcon = () => {
    switch (type) {
      case 'donkey':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-1 flex items-center justify-center shadow-lg border-2 border-pink-300">
              <span className="text-3xl md:text-4xl">🪅</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-pink-300 tracking-wider mt-0.5">
              PIÑATA
            </span>
          </div>
        );
      case 'skull':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-purple-500 via-fuchsia-700 to-slate-900 p-1 flex items-center justify-center shadow-md border border-purple-300">
              <span className="text-2xl md:text-3xl">💀</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-purple-300 mt-0.5">
              CALAVERA
            </span>
          </div>
        );
      case 'maracas':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 p-1 flex items-center justify-center shadow-md border border-amber-300">
              <span className="text-2xl md:text-3xl">🪇</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-amber-300 mt-0.5">
              MARACAS
            </span>
          </div>
        );
      case 'taco':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-yellow-400 via-amber-500 to-orange-600 p-1 flex items-center justify-center shadow-md border border-yellow-300">
              <span className="text-2xl md:text-3xl">🌮</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-yellow-300 mt-0.5">
              TACO
            </span>
          </div>
        );
      case 'guitar':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-emerald-400 via-teal-600 to-slate-900 p-1 flex items-center justify-center shadow-md border border-emerald-300">
              <span className="text-2xl md:text-3xl">🎸</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-emerald-300 mt-0.5">
              GUITAR
            </span>
          </div>
        );
      case 'wild':
        return (
          <div className="relative flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-600 p-1 flex flex-col items-center justify-center shadow-xl border-2 border-yellow-200">
              <Star className="w-6 h-6 text-white fill-yellow-200" />
              <span className="text-[10px] md:text-[11px] font-black text-white tracking-widest">
                WILD
              </span>
            </div>
          </div>
        );
      case 'scatter':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-800 p-1 flex flex-col items-center justify-center shadow-xl border-2 border-fuchsia-300 animate-bounce">
              <span className="text-2xl md:text-3xl">⭐</span>
              <span className="text-[8px] md:text-[9px] font-black text-fuchsia-100 tracking-wider">
                SCATTER
              </span>
            </div>
          </div>
        );
      case 'a':
      case 'k':
      case 'q':
      case 'j':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <span
              className="text-2xl md:text-3xl font-black font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ color: meta.color }}
            >
              {type.toUpperCase()}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none transition-all duration-200 ${
        winHighlight
          ? 'scale-105 ring-2 ring-pink-400 bg-pink-950/40 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.8)]'
          : ''
      } ${
        isGoldFramed
          ? 'ring-2 ring-amber-400 bg-amber-950/20 rounded-xl shadow-[0_0_10px_rgba(251,191,36,0.5)]'
          : ''
      }`}
    >
      {/* Gold Frame Badge Indicator */}
      {isGoldFramed && (
        <span className="absolute -top-1 -left-1 px-1 py-0.2 bg-amber-400 text-slate-950 text-[8px] font-black rounded shadow">
          GOLD
        </span>
      )}

      {/* Multiplier Star Badge */}
      {pinataMultiplier && (
        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black text-[10px] rounded-full border border-yellow-300 shadow-md flex items-center gap-0.5 animate-pulse">
          <Star className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
          <span>x{pinataMultiplier}</span>
        </div>
      )}

      {renderIcon()}
    </div>
  );
};
