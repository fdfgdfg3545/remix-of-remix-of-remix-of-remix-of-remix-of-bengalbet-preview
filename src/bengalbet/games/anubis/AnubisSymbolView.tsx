// @ts-nocheck
import React from 'react';
import { AnubisSymbolType, ANUBIS_SYMBOLS_META } from './anubisTypes';
import { Sparkles, Flame, Eye, Crown, Shield, Gem } from 'lucide-react';

interface AnubisSymbolViewProps {
  type: AnubisSymbolType;
  isWrathCharged?: boolean;
  winHighlight?: boolean;
}

export const AnubisSymbolView: React.FC<AnubisSymbolViewProps> = ({
  type,
  isWrathCharged = false,
  winHighlight = false
}) => {
  const meta = ANUBIS_SYMBOLS_META[type];

  const renderIcon = () => {
    switch (type) {
      case 'anubis':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-gradient-to-b from-cyan-500 via-teal-700 to-slate-950 p-1 flex items-center justify-center shadow-lg border border-cyan-300">
              <span className="text-2xl md:text-3xl">🐺</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-cyan-300 tracking-wider mt-0.5">
              ANUBIS
            </span>
          </div>
        );
      case 'scarab':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-amber-400 via-yellow-600 to-amber-950 p-1 flex items-center justify-center shadow-md border border-amber-300">
              <span className="text-2xl md:text-3xl">🪲</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-amber-300 mt-0.5">
              SCARAB
            </span>
          </div>
        );
      case 'eye':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950 p-1 flex items-center justify-center shadow-md border border-sky-300">
              <Eye className="w-6 h-6 text-cyan-200 fill-cyan-400" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-sky-300 mt-0.5">
              HORUS
            </span>
          </div>
        );
      case 'ankh':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-orange-400 via-amber-600 to-amber-950 p-1 flex items-center justify-center shadow-md border border-amber-400">
              <span className="text-2xl md:text-3xl font-serif text-yellow-200">☥</span>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-yellow-400 mt-0.5">
              ANKH
            </span>
          </div>
        );
      case 'bastet':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-b from-purple-400 via-fuchsia-700 to-purple-950 p-1 flex items-center justify-center shadow-md border border-purple-300">
              <Crown className="w-6 h-6 text-purple-200 fill-purple-400" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-purple-300 mt-0.5">
              BASTET
            </span>
          </div>
        );
      case 'wild':
        return (
          <div className="relative flex flex-col items-center justify-center animate-pulse">
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 p-0.5 flex flex-col items-center justify-center shadow-xl border-2 border-yellow-200">
              <Flame className="w-5 h-5 text-red-600 fill-amber-300" />
              <span className="text-[10px] md:text-[11px] font-black text-white tracking-widest">
                WILD
              </span>
            </div>
          </div>
        );
      case 'scatter':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className="w-11 h-11 md:w-13 md:h-13 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-700 to-slate-900 p-0.5 flex flex-col items-center justify-center shadow-xl border-2 border-indigo-300 animate-bounce">
              <span className="text-xl md:text-2xl">🏛️</span>
              <span className="text-[8px] md:text-[9px] font-black text-indigo-200 tracking-wider">
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
              className="text-2xl md:text-3xl font-black font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
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
          ? 'scale-105 ring-2 ring-cyan-400 bg-cyan-950/40 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.8)]'
          : ''
      } ${isWrathCharged ? 'ring-1 ring-amber-400/80 bg-amber-950/30' : ''}`}
    >
      {isWrathCharged && (
        <span className="absolute -top-1 -right-1 text-xs animate-ping">⚡</span>
      )}
      {renderIcon()}
    </div>
  );
};
