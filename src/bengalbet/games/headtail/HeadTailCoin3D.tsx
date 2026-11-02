// @ts-nocheck
import React from 'react';

export type CoinSide = 'HEAD' | 'TAIL';

interface HeadTailCoin3DProps {
  side: CoinSide;
  isFlipping: boolean;
  flipRotation: number; // calculated total degrees
  size?: number; // diameter in pixels
  showSparkle?: boolean;
}

export const HeadTailCoin3D: React.FC<HeadTailCoin3DProps> = ({
  side,
  isFlipping,
  flipRotation,
  size = 180,
  showSparkle = false
}) => {
  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none"
      style={{ width: size, height: size + 40, perspective: 1200 }}
    >
      {/* 3D Flipping Coin Wrapper */}
      <div
        className={`relative cursor-pointer transition-all ${
          isFlipping ? 'ease-out' : 'transition-transform duration-500'
        }`}
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: `rotateY(${flipRotation}deg) ${isFlipping ? 'translateY(-65px) scale(1.15)' : 'translateY(0px) scale(1)'}`,
          transitionDuration: isFlipping ? '1.4s' : '0.5s',
          transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {/* ================= FRONT: HEAD SIDE (24K GOLD LION CROWN) ================= */}
        <div
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),_inset_0_-4px_12px_rgba(113,63,18,0.9),_0_10px_25px_rgba(0,0,0,0.6)]"
          style={{
            backfaceVisibility: 'hidden',
            background: 'radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde047 25%, #eab308 55%, #ca8a04 80%, #713f12 100%)',
            border: `${Math.max(4, size * 0.045)}px solid #fbbf24`,
          }}
        >
          {/* Milled Coin Edge Ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-amber-800/40 pointer-events-none" />
          
          {/* Inner Golden Rim */}
          <div className="absolute inset-3 rounded-full border border-yellow-200/60 shadow-[inset_0_0_10px_rgba(202,138,4,0.6)] pointer-events-none" />

          {/* Top Arc Text: HEADS / হেড */}
          <div className="absolute top-3 text-center pointer-events-none">
            <span 
              className="font-black tracking-widest text-amber-950 uppercase font-serif drop-shadow-[0_1px_1px_rgba(254,240,138,0.9)]"
              style={{ fontSize: Math.max(10, size * 0.075) }}
            >
              ★ HEADS ★
            </span>
          </div>

          {/* Centerpiece: Majestic Crowned Lion Emblem */}
          <div className="relative flex flex-col items-center justify-center my-auto drop-shadow-[0_3px_6px_rgba(113,63,18,0.7)]">
            <svg 
              width={size * 0.44} 
              height={size * 0.44} 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            >
              {/* Crown Top */}
              <path 
                d="M25 40 L35 25 L50 35 L65 25 L75 40 L70 48 L30 48 Z" 
                fill="#854d0e" 
                stroke="#fef08a" 
                strokeWidth="2" 
              />
              <circle cx="35" cy="25" r="3" fill="#fde047" stroke="#713f12" />
              <circle cx="50" cy="33" r="3.5" fill="#ef4444" stroke="#713f12" />
              <circle cx="65" cy="25" r="3" fill="#fde047" stroke="#713f12" />

              {/* Lion Face / Silhouette */}
              <circle cx="50" cy="62" r="22" fill="#a16207" stroke="#fef08a" strokeWidth="2.5" />
              {/* Mane Spikes */}
              <path 
                d="M28 56 Q20 62 26 70 Q22 78 32 82 Q42 88 50 86 Q58 88 68 82 Q78 78 74 70 Q80 62 72 56" 
                fill="none" 
                stroke="#713f12" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              {/* Eyes and Nose */}
              <ellipse cx="43" cy="58" rx="2.5" ry="3.5" fill="#451a03" />
              <ellipse cx="57" cy="58" rx="2.5" ry="3.5" fill="#451a03" />
              <polygon points="50,65 46,70 54,70" fill="#713f12" />
              <path d="M46 72 Q50 76 54 72" stroke="#451a03" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>

            {/* Sub-label */}
            <span 
              className="font-black text-amber-950 uppercase tracking-wider font-mono drop-shadow-[0_1px_1px_rgba(254,240,138,0.8)] -mt-0.5"
              style={{ fontSize: Math.max(9, size * 0.065) }}
            >
              হেড • H
            </span>
          </div>

          {/* Bottom Stars & Year */}
          <div className="absolute bottom-3 flex items-center gap-1 text-amber-950 pointer-events-none">
            <span className="text-[10px] sm:text-xs">✦</span>
            <span 
              className="font-bold font-mono tracking-wider"
              style={{ fontSize: Math.max(8, size * 0.055) }}
            >
              1.96X WIN
            </span>
            <span className="text-[10px] sm:text-xs">✦</span>
          </div>

          {/* Holographic light sheen reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none" />
        </div>

        {/* ================= BACK: TAIL SIDE (ROYAL PLATINUM EAGLE/STAR) ================= */}
        <div
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_2px_8px_rgba(255,255,255,0.7),_inset_0_-4px_12px_rgba(20,50,80,0.9),_0_10px_25px_rgba(0,0,0,0.6)]"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'radial-gradient(circle at 35% 30%, #f0fdf4 0%, #67e8f9 20%, #0284c7 55%, #0369a1 80%, #082f49 100%)',
            border: `${Math.max(4, size * 0.045)}px solid #38bdf8`,
          }}
        >
          {/* Milled Coin Edge Ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-cyan-950/40 pointer-events-none" />
          
          {/* Inner Cyan/Silver Rim */}
          <div className="absolute inset-3 rounded-full border border-cyan-200/60 shadow-[inset_0_0_10px_rgba(8,145,178,0.6)] pointer-events-none" />

          {/* Top Arc Text: TAILS / টেল */}
          <div className="absolute top-3 text-center pointer-events-none">
            <span 
              className="font-black tracking-widest text-cyan-950 uppercase font-serif drop-shadow-[0_1px_1px_rgba(207,250,254,0.9)]"
              style={{ fontSize: Math.max(10, size * 0.075) }}
            >
              ★ TAILS ★
            </span>
          </div>

          {/* Centerpiece: Majestic Royal Winged Crest & Number 1 */}
          <div className="relative flex flex-col items-center justify-center my-auto drop-shadow-[0_3px_6px_rgba(8,47,73,0.7)]">
            <svg 
              width={size * 0.44} 
              height={size * 0.44} 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            >
              {/* Outer Star Rays */}
              <path 
                d="M50 15 L54 30 L70 30 L57 40 L62 55 L50 45 L38 55 L43 40 L30 30 L46 30 Z" 
                fill="#38bdf8" 
                stroke="#f0fdf4" 
                strokeWidth="1.5" 
              />
              {/* Laurel Wreath */}
              <path 
                d="M25 45 Q22 65 35 78 Q45 84 50 84 Q55 84 65 78 Q78 65 75 45" 
                fill="none" 
                stroke="#082f49" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              {/* Center Numeral 1 / Crest Shield */}
              <path 
                d="M40 45 L50 38 L54 38 L54 72 L46 72 L46 76 L62 76 L62 72 L54 72" 
                fill="#0c4a6e" 
                stroke="#e0f2fe" 
                strokeWidth="2" 
              />
            </svg>

            {/* Sub-label */}
            <span 
              className="font-black text-cyan-950 uppercase tracking-wider font-mono drop-shadow-[0_1px_1px_rgba(207,250,254,0.8)] -mt-0.5"
              style={{ fontSize: Math.max(9, size * 0.065) }}
            >
              টেল • T
            </span>
          </div>

          {/* Bottom Stars & Multiplier */}
          <div className="absolute bottom-3 flex items-center gap-1 text-cyan-950 pointer-events-none">
            <span className="text-[10px] sm:text-xs">✦</span>
            <span 
              className="font-bold font-mono tracking-wider"
              style={{ fontSize: Math.max(8, size * 0.055) }}
            >
              1.96X WIN
            </span>
            <span className="text-[10px] sm:text-xs">✦</span>
          </div>

          {/* Holographic light sheen reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Dynamic 3D Ground Shadow beneath coin */}
      <div 
        className="rounded-full transition-all duration-300 pointer-events-none"
        style={{
          width: isFlipping ? size * 0.45 : size * 0.85,
          height: isFlipping ? 12 : 24,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)',
          filter: isFlipping ? 'blur(8px)' : 'blur(4px)',
          opacity: isFlipping ? 0.35 : 0.75,
          transform: `translateY(${isFlipping ? 30 : 15}px)`
        }}
      />

      {/* Sparkle burst on win */}
      {showSparkle && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-full ring-4 ring-yellow-400/80 animate-ping" />
        </div>
      )}
    </div>
  );
};
