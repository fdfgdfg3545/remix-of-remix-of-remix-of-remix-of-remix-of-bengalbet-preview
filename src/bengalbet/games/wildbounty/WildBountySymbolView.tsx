// @ts-nocheck
import React from 'react';
import { 
  Crosshair, 
  Sparkles, 
  Crown, 
  ShieldAlert, 
  Wine, 
  Star, 
  Coins 
} from 'lucide-react';
import { BountyCell, BOUNTY_SYMBOLS } from './wildBountyTypes';

interface WildBountySymbolViewProps {
  cell: BountyCell;
}

export const WildBountySymbolView: React.FC<WildBountySymbolViewProps> = ({ cell }) => {
  const config = BOUNTY_SYMBOLS[cell.type];

  const renderContent = () => {
    switch (cell.type) {
      case 'cowgirl':
        return (
          <div className="relative flex flex-col items-center justify-center scale-105">
            <span className="text-2xl md:text-3xl filter drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]">
              🤠
            </span>
            <span className="text-[9px] font-black text-amber-300 font-mono tracking-wider uppercase">
              COWGIRL
            </span>
          </div>
        );
      case 'revolver':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <Crosshair className="w-7 h-7 md:w-8 md:h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
            <span className="text-[9px] font-black text-amber-300 font-mono tracking-tight uppercase">
              GUNS
            </span>
          </div>
        );
      case 'hat':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(217,119,6,0.8)]">
              🪓
            </span>
            <span className="text-[9px] font-bold text-amber-400 font-mono uppercase">
              HAT
            </span>
          </div>
        );
      case 'whiskey':
        return (
          <div className="relative flex flex-col items-center justify-center">
            <Wine className="w-6 h-6 md:w-7 md:h-7 text-amber-500 drop-shadow-[0_0_8px_rgba(180,83,9,0.8)]" />
            <span className="text-[9px] font-bold text-amber-400 font-mono uppercase">
              WHISKEY
            </span>
          </div>
        );
      case 'ace':
        return (
          <span className="text-2xl md:text-3xl font-black text-red-500 font-serif tracking-tighter drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
            A
          </span>
        );
      case 'king':
        return (
          <span className="text-2xl md:text-3xl font-black text-purple-400 font-serif tracking-tighter drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]">
            K
          </span>
        );
      case 'queen':
        return (
          <span className="text-2xl md:text-3xl font-black text-blue-400 font-serif tracking-tighter drop-shadow-[0_0_6px_rgba(59,130,246,0.7)]">
            Q
          </span>
        );
      case 'jack':
        return (
          <span className="text-2xl md:text-3xl font-black text-emerald-400 font-serif tracking-tighter drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]">
            J
          </span>
        );
      case 'wild':
        return (
          <div className="flex flex-col items-center justify-center scale-110">
            <Star className="w-7 h-7 md:w-8 md:h-8 text-amber-300 fill-amber-400 animate-spin drop-shadow-[0_0_12px_rgba(251,191,36,1)]" style={{ animationDuration: '6s' }} />
            <span className="text-[9px] font-black text-amber-200 uppercase tracking-widest font-mono drop-shadow-[0_0_6px_#fbbf24] mt-0.5">
              WILD
            </span>
          </div>
        );
      case 'scatter':
        return (
          <div className="flex flex-col items-center justify-center animate-bounce">
            <Coins className="w-7 h-7 md:w-8 md:h-8 text-yellow-300 fill-amber-500 drop-shadow-[0_0_15px_rgba(250,204,21,1)]" />
            <span className="text-[8px] md:text-[9px] font-black text-yellow-200 uppercase tracking-wider font-mono drop-shadow-[0_0_6px_#facc15] mt-0.5">
              SCATTER
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-12 md:h-16 rounded-xl flex items-center justify-center transition-all duration-300 select-none overflow-hidden
        ${cell.isEliminating ? 'scale-0 opacity-0 rotate-45 bg-amber-500' : 'scale-100 opacity-100'}
        ${cell.winHighlight ? 'ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.9)] z-10' : ''}
        ${cell.isGolden 
          ? 'border-2 border-yellow-400 bg-gradient-to-b from-amber-600/30 via-amber-950/70 to-yellow-950/90 shadow-[inset_0_0_12px_rgba(250,204,21,0.6)]' 
          : 'border border-amber-900/40 bg-gradient-to-b from-stone-900/90 via-stone-950 to-neutral-950 shadow-[inset_0_0_6px_rgba(0,0,0,0.8)]'
        }
        ${cell.isWildFromGolden ? 'ring-2 ring-yellow-400 shadow-[0_0_16px_rgba(250,204,21,1)] animate-pulse' : ''}
      `}
    >
      {/* Background warm radial ambience */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`
        }}
      />

      {/* Gold Frame Label on Reels 3 & 4 */}
      {cell.isGolden && (
        <div className="absolute top-0.5 right-1 text-[7px] md:text-[8px] font-mono font-black text-amber-300 bg-amber-950/90 px-1 rounded border border-amber-400/80 shadow">
          GOLD
        </div>
      )}

      {/* Wild transform badge */}
      {cell.isWildFromGolden && (
        <div className="absolute top-0.5 left-1 text-[7px] md:text-[8px] font-mono font-black text-yellow-300 bg-amber-950/90 px-1 rounded border border-yellow-400 shadow">
          STAR
        </div>
      )}

      <div className="relative z-10 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};
