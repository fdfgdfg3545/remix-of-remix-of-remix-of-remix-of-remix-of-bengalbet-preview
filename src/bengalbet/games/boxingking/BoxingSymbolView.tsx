// @ts-nocheck
import React from 'react';
import { BoxingSymbolId, BOXING_SYMBOLS } from './boxingKingTypes';

interface BoxingSymbolViewProps {
  symbol: BoxingSymbolId;
  isWinning?: boolean;
  isExMatch?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BoxingSymbolView: React.FC<BoxingSymbolViewProps> = ({
  symbol,
  isWinning = false,
  isExMatch = false,
  size = 'md'
}) => {
  const config = BOXING_SYMBOLS[symbol];

  const renderGraphic = () => {
    const iconClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10 sm:w-12 sm:h-12';

    switch (symbol) {
      case 'RED_BOXER':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className={`${iconClass} flex items-center justify-center`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                <defs>
                  <linearGradient id="redBoxerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FCA5A5" />
                    <stop offset="40%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </linearGradient>
                </defs>
                {/* Boxer Muscular Torso */}
                <path d="M25 90 L32 55 L40 45 L60 45 L68 55 L75 90 Z" fill="url(#redBoxerGrad)" stroke="#450A0A" strokeWidth="2" />
                {/* Muscular Chest & Abs */}
                <path d="M42 55 Q50 62 58 55 Q50 75 42 55 Z" fill="#B91C1C" />
                <line x1="50" y1="58" x2="50" y2="82" stroke="#450A0A" strokeWidth="2" />
                {/* Head & Red Headgear */}
                <circle cx="50" cy="28" r="18" fill="#F87171" stroke="#991B1B" strokeWidth="2" />
                <path d="M36 22 C36 12 64 12 64 22 L64 34 L36 34 Z" fill="#DC2626" />
                <rect x="42" y="32" width="16" height="5" rx="2" fill="#FFFFFF" />
                {/* Raised Boxing Glove Left */}
                <circle cx="24" cy="46" r="13" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
                <circle cx="76" cy="46" r="13" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[8px] font-black text-red-300 uppercase tracking-tighter -mt-1 bg-red-950/80 px-1 rounded border border-red-500/50">
              CHAMP
            </span>
          </div>
        );

      case 'BLUE_BOXER':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className={`${iconClass} flex items-center justify-center`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                <defs>
                  <linearGradient id="blueBoxerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#93C5FD" />
                    <stop offset="40%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                </defs>
                <path d="M25 90 L32 55 L40 45 L60 45 L68 55 L75 90 Z" fill="url(#blueBoxerGrad)" stroke="#0F172A" strokeWidth="2" />
                <path d="M42 55 Q50 62 58 55 Q50 75 42 55 Z" fill="#1D4ED8" />
                <line x1="50" y1="58" x2="50" y2="82" stroke="#0F172A" strokeWidth="2" />
                <circle cx="50" cy="28" r="18" fill="#60A5FA" stroke="#1E40AF" strokeWidth="2" />
                <path d="M36 22 C36 12 64 12 64 22 L64 34 L36 34 Z" fill="#2563EB" />
                <rect x="42" y="32" width="16" height="5" rx="2" fill="#FFFFFF" />
                <circle cx="24" cy="46" r="13" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                <circle cx="76" cy="46" r="13" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[8px] font-black text-blue-300 uppercase tracking-tighter -mt-1 bg-blue-950/80 px-1 rounded border border-blue-500/50">
              TITAN
            </span>
          </div>
        );

      case 'RED_GLOVES':
        return (
          <div className={`${iconClass} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
              <defs>
                <linearGradient id="redGloveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCA5A5" />
                  <stop offset="50%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#7F1D1D" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="45" rx="32" ry="30" fill="url(#redGloveGrad)" stroke="#FEE2E2" strokeWidth="2" />
              <ellipse cx="28" cy="40" rx="14" ry="12" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
              {/* Laces & Wrist Wrap */}
              <rect x="30" y="70" width="40" height="20" rx="4" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
              <line x1="38" y1="75" x2="62" y2="85" stroke="#991B1B" strokeWidth="2" />
              <line x1="62" y1="75" x2="38" y2="85" stroke="#991B1B" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'BLUE_GLOVES':
        return (
          <div className={`${iconClass} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]">
              <defs>
                <linearGradient id="blueGloveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#BFDBFE" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#172554" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="45" rx="32" ry="30" fill="url(#blueGloveGrad)" stroke="#DBEAFE" strokeWidth="2" />
              <ellipse cx="28" cy="40" rx="14" ry="12" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
              <rect x="30" y="70" width="40" height="20" rx="4" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
              <line x1="38" y1="75" x2="62" y2="85" stroke="#1E3A8A" strokeWidth="2" />
              <line x1="62" y1="75" x2="38" y2="85" stroke="#1E3A8A" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'RED_SHORTS':
        return (
          <div className={`${iconClass} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
              <rect x="25" y="20" width="50" height="12" fill="#FACC15" rx="2" />
              <path d="M25 32 L15 80 L46 80 L50 50 L54 80 L85 80 L75 32 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
              <rect x="15" y="74" width="31" height="6" fill="#FACC15" />
              <rect x="54" y="74" width="31" height="6" fill="#FACC15" />
            </svg>
          </div>
        );

      case 'BLUE_BOOTS':
        return (
          <div className={`${iconClass} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
              <path d="M30 15 L50 15 L50 65 L75 75 L75 88 L25 88 L25 30 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />
              <path d="M50 88 L75 88 L75 80 L50 80 Z" fill="#FFFFFF" />
              {/* Laces */}
              <line x1="32" y1="25" x2="48" y2="25" stroke="#FACC15" strokeWidth="2" />
              <line x1="32" y1="35" x2="48" y2="35" stroke="#FACC15" strokeWidth="2" />
              <line x1="32" y1="45" x2="48" y2="45" stroke="#FACC15" strokeWidth="2" />
            </svg>
          </div>
        );

      case 'WILD':
        return (
          <div className="relative flex flex-col items-center justify-center animate-pulse">
            <div className={`${iconClass} flex items-center justify-center`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]">
                <defs>
                  <linearGradient id="wildBeltGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="40%" stopColor="#FACC15" />
                    <stop offset="80%" stopColor="#CA8A04" />
                    <stop offset="100%" stopColor="#854D0E" />
                  </linearGradient>
                </defs>
                {/* Thick Leather Belt strap */}
                <path d="M5 45 L95 45 L95 65 L5 65 Z" fill="#1C1917" stroke="#78350F" strokeWidth="2" />
                {/* Center Giant Championship Medallion */}
                <circle cx="50" cy="55" r="28" fill="url(#wildBeltGold)" stroke="#FFF" strokeWidth="2.5" />
                {/* Eagle Crown */}
                <polygon points="50,34 56,44 44,44" fill="#78350F" />
                <polygon points="50,42 62,56 50,52 38,56" fill="#EF4444" />
                {/* Gems on belt */}
                <circle cx="20" cy="55" r="6" fill="url(#wildBeltGold)" />
                <circle cx="80" cy="55" r="6" fill="url(#wildBeltGold)" />
              </svg>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(234,179,8,0.9)] border border-white -mt-1">
              WILD
            </span>
          </div>
        );

      case 'SCATTER':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <div className={`${iconClass} flex items-center justify-center animate-bounce`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]">
                <defs>
                  <linearGradient id="bellGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="35%" stopColor="#EAB308" />
                    <stop offset="85%" stopColor="#A16207" />
                    <stop offset="100%" stopColor="#713F12" />
                  </linearGradient>
                </defs>
                {/* Heavy Boxing Ring Gong Bell */}
                <path d="M50 15 C30 15 20 40 18 70 L82 70 C80 40 70 15 50 15 Z" fill="url(#bellGoldGrad)" stroke="#FFFBEB" strokeWidth="2" />
                {/* Rim */}
                <rect x="14" y="68" width="72" height="10" rx="3" fill="url(#bellGoldGrad)" stroke="#78350F" strokeWidth="1" />
                {/* Clapper ball */}
                <circle cx="50" cy="84" r="8" fill="#F97316" stroke="#FFF" strokeWidth="1" />
                {/* Suspension loop */}
                <circle cx="50" cy="14" r="6" fill="none" stroke="url(#bellGoldGrad)" strokeWidth="3" />
              </svg>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-yellow-300 bg-red-950 px-1.5 py-0.5 rounded border border-yellow-400 -mt-1 shadow">
              FREE
            </span>
          </div>
        );

      case 'ACE':
        return (
          <span className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-yellow-600 drop-shadow">
            A
          </span>
        );
      case 'KING':
        return (
          <span className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-purple-100 via-purple-400 to-indigo-700 drop-shadow">
            K
          </span>
        );
      case 'QUEEN':
        return (
          <span className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-pink-100 via-pink-400 to-rose-700 drop-shadow">
            Q
          </span>
        );
      case 'JACK':
        return (
          <span className="font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-400 to-blue-700 drop-shadow">
            J
          </span>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center rounded-xl select-none transition-all duration-300 p-1 border ${
        isWinning
          ? 'bg-gradient-to-b from-red-600/30 to-amber-500/40 border-yellow-300 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-95 animate-pulse'
          : isExMatch
          ? 'bg-gradient-to-b from-amber-500/20 to-yellow-600/30 border-yellow-400/80 shadow-[0_0_10px_rgba(234,179,8,0.6)]'
          : 'bg-gradient-to-b from-[#181124] to-[#0a0711] border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {renderGraphic()}

      {/* ExMATCH badge */}
      {isExMatch && (
        <span className="absolute -top-1.5 -right-1.5 px-1 bg-yellow-400 text-black font-black text-[8px] rounded uppercase shadow">
          ExMATCH
        </span>
      )}
    </div>
  );
};
