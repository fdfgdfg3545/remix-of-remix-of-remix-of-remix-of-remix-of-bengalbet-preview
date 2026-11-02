// @ts-nocheck
import React from 'react';

interface Point {
  col: number; // 0 to 4
  row: number; // 0 to 3
}

interface BigJokerLightningOverlayProps {
  source: Point | null;
  targets: Point[];
}

export const BigJokerLightningOverlay: React.FC<BigJokerLightningOverlayProps> = ({ source, targets }) => {
  if (!source || targets.length === 0) return null;

  // Each col is 20% width (0% to 100%), each row is 25% height (0% to 100%)
  // Center of cell (col, row):
  const getCellCenterPercent = (col: number, row: number) => {
    return {
      x: (col + 0.5) * 20,
      y: (row + 0.5) * 25
    };
  };

  const srcPt = getCellCenterPercent(source.col, source.row);

  // Generate jagged zig-zag lightning path between two percentage points
  const generateJaggedPath = (x1: number, y1: number, x2: number, y2: number, seed: number) => {
    const steps = 6;
    let pathStr = `M ${x1} ${y1}`;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      // Linear interpolation
      const lx = x1 + (x2 - x1) * t;
      const ly = y1 + (y2 - y1) * t;
      // Perpendicular displacement with pseudo-random jitter
      const dx = y2 - y1;
      const dy = -(x2 - x1);
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const jitter = ((Math.sin(seed + i * 3.7) + Math.cos(seed * 2 + i * 1.9)) / 2) * 4;
      const jx = lx + (dx / len) * jitter;
      const jy = ly + (dy / len) * jitter;
      pathStr += ` L ${jx} ${jy}`;
    }
    pathStr += ` L ${x2} ${y2}`;
    return pathStr;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="lightningGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {targets.map((tgt, idx) => {
          const tgtPt = getCellCenterPercent(tgt.col, tgt.row);
          const pathPrimary = generateJaggedPath(srcPt.x, srcPt.y, tgtPt.x, tgtPt.y, idx * 5 + 1);
          const pathSecondary = generateJaggedPath(srcPt.x, srcPt.y, tgtPt.x, tgtPt.y, idx * 5 + 3);

          return (
            <g key={`lightning-${tgt.col}-${tgt.row}-${idx}`}>
              {/* Outer Golden Glow Lightning */}
              <path
                d={pathPrimary}
                fill="none"
                stroke="#facc15"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lightningGlow)"
                className="animate-pulse"
                opacity="0.85"
              />

              {/* Inner Bright White Electric Core */}
              <path
                d={pathSecondary}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Target Impact Burst */}
              <circle
                cx={tgtPt.x}
                cy={tgtPt.y}
                r="3.5"
                fill="#fde047"
                className="animate-ping"
              />
              <circle
                cx={tgtPt.x}
                cy={tgtPt.y}
                r="2"
                fill="#ffffff"
              />
            </g>
          );
        })}

        {/* Source Big Joker Energy Burst */}
        <circle
          cx={srcPt.x}
          cy={srcPt.y}
          r="4.5"
          fill="#fbbf24"
          className="animate-ping"
        />
        <circle
          cx={srcPt.x}
          cy={srcPt.y}
          r="2.5"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
};
