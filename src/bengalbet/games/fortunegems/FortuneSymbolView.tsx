// @ts-nocheck
import React from 'react';
import { SymbolId, FORTUNE_SYMBOLS } from './fortuneGemsTypes';

interface FortuneSymbolViewProps {
  symbol: SymbolId;
  splitCount?: 1 | 2 | 3;
  isWinning?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FortuneSymbolView: React.FC<FortuneSymbolViewProps> = ({
  symbol,
  splitCount = 1,
  isWinning = false,
  size = 'md'
}) => {
  const config = FORTUNE_SYMBOLS[symbol];

  const renderSingleSymbolGraphic = (mini: boolean = false) => {
    const iconSize = mini ? 'w-5 h-5 sm:w-6 sm:h-6' : size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-12 sm:h-12';

    switch (symbol) {
      case 'WILD':
        return (
          <div className="relative flex items-center justify-center">
            {/* Garuda Golden Eagle Wild */}
            <div className={`relative ${iconSize} flex items-center justify-center animate-pulse`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                <defs>
                  <linearGradient id="garudaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="30%" stopColor="#FDE047" />
                    <stop offset="70%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                  <linearGradient id="garudaGem" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#991B1B" />
                  </linearGradient>
                </defs>
                {/* Outer halo */}
                <circle cx="50" cy="50" r="46" fill="none" stroke="url(#garudaGold)" strokeWidth="3" strokeDasharray="4 2" />
                {/* Garuda Wings */}
                <path d="M50 15 C30 2 10 25 5 45 C15 48 32 40 45 42 C48 30 49 20 50 15 Z" fill="url(#garudaGold)" />
                <path d="M50 15 C70 2 90 25 95 45 C85 48 68 40 55 42 C52 30 51 20 50 15 Z" fill="url(#garudaGold)" />
                {/* Center Head & Beak */}
                <polygon points="50,22 62,38 56,48 50,42 44,48 38,38" fill="url(#garudaGold)" stroke="#78350F" strokeWidth="1" />
                <polygon points="46,40 54,40 50,52" fill="#F97316" />
                {/* Ruby in forehead */}
                <polygon points="50,26 53,30 50,34 47,30" fill="url(#garudaGem)" />
                {/* Body & Claws */}
                <path d="M42 50 C42 68 38 78 30 84 C40 82 46 76 50 72 C54 76 60 82 70 84 C62 78 58 68 58 50 Z" fill="url(#garudaGold)" />
                {/* Base pedestal */}
                <rect x="25" y="85" width="50" height="9" rx="3" fill="url(#garudaGold)" stroke="#78350F" strokeWidth="1" />
              </svg>
            </div>
            {!mini && (
              <span className="absolute -bottom-2 text-[9px] sm:text-[10px] font-black tracking-widest text-yellow-300 bg-amber-950/90 px-1.5 py-0.2 rounded border border-yellow-400/80 shadow">
                WILD
              </span>
            )}
          </div>
        );

      case 'RED_GEM':
        return (
          <div className="relative flex items-center justify-center">
            <div className={`relative ${iconSize} flex items-center justify-center`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                <defs>
                  <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FECACA" />
                    <stop offset="25%" stopColor="#EF4444" />
                    <stop offset="70%" stopColor="#B91C1C" />
                    <stop offset="100%" stopColor="#7F1D1D" />
                  </linearGradient>
                  <linearGradient id="rubyGoldFrame" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
                {/* Golden sunburst mount */}
                <circle cx="50" cy="50" r="44" fill="none" stroke="url(#rubyGoldFrame)" strokeWidth="4" />
                <polygon points="50,6 55,16 65,10 65,22 76,20 72,31 82,35 74,44 82,53 72,58 78,69 66,70 66,81 55,77 50,88 45,77 34,81 34,70 22,69 28,58 18,53 26,44 18,35 28,31 24,20 35,22 35,10 45,16" fill="url(#rubyGoldFrame)" opacity="0.5" />
                {/* Ruby Diamond Facet */}
                <polygon points="50,16 78,35 78,65 50,84 22,65 22,35" fill="url(#rubyGrad)" stroke="#FFE4E6" strokeWidth="2" />
                <polygon points="50,16 64,35 50,50 36,35" fill="#FECACA" opacity="0.6" />
                <polygon points="50,50 64,35 78,35 78,65 50,50" fill="#EF4444" opacity="0.8" />
                <polygon points="50,50 78,65 50,84" fill="#991B1B" />
                <polygon points="50,50 50,84 22,65" fill="#7F1D1D" />
                <polygon points="50,50 22,65 22,35 36,35" fill="#DC2626" />
              </svg>
            </div>
          </div>
        );

      case 'BLUE_GEM':
        return (
          <div className="relative flex items-center justify-center">
            <div className={`relative ${iconSize} flex items-center justify-center`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]">
                <defs>
                  <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DBEAFE" />
                    <stop offset="30%" stopColor="#3B82F6" />
                    <stop offset="70%" stopColor="#1D4ED8" />
                    <stop offset="100%" stopColor="#1E3A8A" />
                  </linearGradient>
                  <linearGradient id="sapphireGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="100%" stopColor="#CA8A04" />
                  </linearGradient>
                </defs>
                {/* Filigree temple frame */}
                <rect x="10" y="10" width="80" height="80" rx="16" fill="none" stroke="url(#sapphireGold)" strokeWidth="4" />
                {/* Teardrop / Hexagon Gem */}
                <polygon points="50,12 82,38 82,62 50,88 18,62 18,38" fill="url(#sapphireGrad)" stroke="#BFDBFE" strokeWidth="2" />
                <polygon points="50,12 66,38 50,50 34,38" fill="#DBEAFE" opacity="0.6" />
                <polygon points="66,38 82,38 82,62 50,50" fill="#2563EB" />
                <polygon points="50,50 82,62 50,88" fill="#1E40AF" />
                <polygon points="50,50 50,88 18,62" fill="#172554" />
                <polygon points="34,38 50,50 18,62 18,38" fill="#3B82F6" />
              </svg>
            </div>
          </div>
        );

      case 'GREEN_GEM':
        return (
          <div className="relative flex items-center justify-center">
            <div className={`relative ${iconSize} flex items-center justify-center`}>
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]">
                <defs>
                  <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1FAE5" />
                    <stop offset="30%" stopColor="#10B981" />
                    <stop offset="70%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </linearGradient>
                  <linearGradient id="emeraldGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE047" />
                    <stop offset="100%" stopColor="#A16207" />
                  </linearGradient>
                </defs>
                {/* Lotus gold frame */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#emeraldGold)" strokeWidth="3.5" />
                {/* Emerald Octagon */}
                <polygon points="32,16 68,16 84,32 84,68 68,84 32,84 16,68 16,32" fill="url(#emeraldGrad)" stroke="#A7F3D0" strokeWidth="2" />
                <polygon points="38,28 62,28 72,38 72,62 62,72 38,72 28,62 28,38" fill="#34D399" opacity="0.7" />
                <polygon points="32,16 68,16 62,28 38,28" fill="#D1FAE5" opacity="0.6" />
                <polygon points="84,32 84,68 72,62 72,38" fill="#059669" />
                <polygon points="68,84 32,84 38,72 62,72" fill="#064E3B" />
                <polygon points="16,68 16,32 28,38 28,62" fill="#047857" />
              </svg>
            </div>
          </div>
        );

      case 'ACE':
        return (
          <div className="flex items-center justify-center font-black tracking-tighter">
            <span className={`text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-400 to-amber-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              mini ? 'text-sm font-black' : size === 'sm' ? 'text-base' : size === 'lg' ? 'text-4xl' : 'text-2xl sm:text-3xl'
            }`}>
              A
            </span>
          </div>
        );

      case 'KING':
        return (
          <div className="flex items-center justify-center font-black tracking-tighter">
            <span className={`text-transparent bg-clip-text bg-gradient-to-b from-purple-100 via-purple-400 to-indigo-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              mini ? 'text-sm font-black' : size === 'sm' ? 'text-base' : size === 'lg' ? 'text-4xl' : 'text-2xl sm:text-3xl'
            }`}>
              K
            </span>
          </div>
        );

      case 'QUEEN':
        return (
          <div className="flex items-center justify-center font-black tracking-tighter">
            <span className={`text-transparent bg-clip-text bg-gradient-to-b from-pink-100 via-pink-400 to-rose-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              mini ? 'text-sm font-black' : size === 'sm' ? 'text-base' : size === 'lg' ? 'text-4xl' : 'text-2xl sm:text-3xl'
            }`}>
              Q
            </span>
          </div>
        );

      case 'JACK':
        return (
          <div className="flex items-center justify-center font-black tracking-tighter">
            <span className={`text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-cyan-400 to-blue-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              mini ? 'text-sm font-black' : size === 'sm' ? 'text-base' : size === 'lg' ? 'text-4xl' : 'text-2xl sm:text-3xl'
            }`}>
              J
            </span>
          </div>
        );
    }
  };

  // Render Split Symbol Container
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center rounded-lg select-none transition-all duration-300 ${
        isWinning
          ? 'bg-gradient-to-b from-amber-500/25 to-yellow-600/30 border-2 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-pulse'
          : 'bg-gradient-to-b from-[#1c1829] to-[#0d0a17] border border-amber-900/40 hover:border-amber-700/60'
      }`}
      style={{
        boxShadow: isWinning ? `0 0 20px ${config.glow}` : 'inset 0 1px 3px rgba(255,255,255,0.06)'
      }}
    >
      {/* 1x Single Symbol */}
      {splitCount === 1 && (
        <div className="w-full h-full flex items-center justify-center p-1">
          {renderSingleSymbolGraphic(false)}
        </div>
      )}

      {/* 2x Split Symbol (2 mini symbols side by side or stacked) */}
      {splitCount === 2 && (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-1">
          <div className="grid grid-cols-2 gap-1 w-full h-full items-center justify-items-center">
            {renderSingleSymbolGraphic(true)}
            {renderSingleSymbolGraphic(true)}
          </div>
          {/* Split 2X badge */}
          <div className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-[9px] rounded-full border border-yellow-100 shadow-[0_0_6px_rgba(234,179,8,0.8)] flex items-center gap-0.5">
            <span>⚡</span>
            <span>2X</span>
          </div>
        </div>
      )}

      {/* 3x Split Symbol (3 mini symbols arranged compactly) */}
      {splitCount === 3 && (
        <div className="w-full h-full flex flex-col items-center justify-center relative p-1">
          <div className="w-full h-full flex flex-col items-center justify-between py-1">
            <div className="w-full flex justify-center">
              {renderSingleSymbolGraphic(true)}
            </div>
            <div className="w-full grid grid-cols-2 gap-0.5 items-center justify-items-center">
              {renderSingleSymbolGraphic(true)}
              {renderSingleSymbolGraphic(true)}
            </div>
          </div>
          {/* Split 3X badge */}
          <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 text-black font-black text-[9px] rounded-full border border-white shadow-[0_0_8px_rgba(239,68,68,0.9)] flex items-center gap-0.5 animate-bounce">
            <span>🔥</span>
            <span>3X</span>
          </div>
        </div>
      )}

      {/* Corner Aztec/Temple accents */}
      <div className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-yellow-500/40" />
      <div className="absolute top-0.5 right-0.5 w-1 h-1 border-t border-r border-yellow-500/40" />
      <div className="absolute bottom-0.5 left-0.5 w-1 h-1 border-b border-l border-yellow-500/40" />
      <div className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-yellow-500/40" />
    </div>
  );
};
