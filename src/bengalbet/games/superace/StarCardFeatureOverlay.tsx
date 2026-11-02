// @ts-nocheck
import React from 'react';

interface Point {
  col: number; // 0 to 4
  row: number; // 0 to 3
}

interface StarCardFeatureOverlayProps {
  isActive: boolean;
  targets: Point[];
  language: 'bn' | 'en';
}

export const StarCardFeatureOverlay: React.FC<StarCardFeatureOverlayProps> = ({
  isActive,
  targets,
  language
}) => {
  if (!isActive) return null;

  // Center of star origin (at center of grid or top center)
  const starOrigin = { x: 50, y: 35 };

  // Calculate percentage center for any cell
  const getCellCenter = (col: number, row: number) => {
    return {
      x: (col + 0.5) * 20,
      y: (row + 0.5) * 25
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
      {/* Darkened ambient glow backdrop */}
      <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] animate-pulse" />

      {/* SVG Laser Beams shooting from Star Card to transformed cards */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="starBeamGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fde047" />
            <stop offset="80%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {targets.map((tgt, idx) => {
          const pt = getCellCenter(tgt.col, tgt.row);
          return (
            <g key={`star-beam-${tgt.col}-${tgt.row}-${idx}`}>
              {/* Outer Golden Glow Ray */}
              <line
                x1={starOrigin.x}
                y1={starOrigin.y}
                x2={pt.x}
                y2={pt.y}
                stroke="#facc15"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#starGlow)"
                className="animate-pulse"
                opacity="0.9"
              />

              {/* Inner Radiant White Core */}
              <line
                x1={starOrigin.x}
                y1={starOrigin.y}
                x2={pt.x}
                y2={pt.y}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Target Transformation Impact Burst */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#fde047"
                className="animate-ping"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r="2.5"
                fill="#ffffff"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating Center Star Card Badge */}
      <div className="relative z-40 flex flex-col items-center justify-center animate-bounce drop-shadow-[0_0_25px_rgba(250,204,21,0.9)]">
        {/* Radiant Star Emblem */}
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Pulsing Aura */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-purple-600 blur-lg animate-spin" />
          
          <div className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border-2 sm:border-3 border-white shadow-2xl flex flex-col items-center justify-center p-2">
            <span className="text-3xl sm:text-5xl filter drop-shadow">⭐</span>
            <span className="text-[9px] sm:text-xs font-black text-amber-950 uppercase tracking-wider font-mono">
              STAR CARD
            </span>
          </div>

          {/* Sparkle Badges */}
          <span className="absolute -top-2 -left-2 text-lg sm:text-xl animate-pulse">✨</span>
          <span className="absolute -bottom-2 -right-2 text-lg sm:text-xl animate-pulse">✨</span>
        </div>

        {/* Action Banner */}
        <div className="mt-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl border border-white whitespace-nowrap">
          {language === 'bn' ? '★ স্টার কার্ড অ্যাক্টিভেটেড! গোল্ডেন কার্ড তৈরি হচ্ছে! ★' : '★ STAR CARD ACTIVATED! GOLDEN CARDS CREATED! ★'}
        </div>
      </div>
    </div>
  );
};
