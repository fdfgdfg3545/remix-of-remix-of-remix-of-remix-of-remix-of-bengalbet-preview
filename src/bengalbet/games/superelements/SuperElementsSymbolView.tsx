// @ts-nocheck
import React from 'react';
import { 
  Flame, 
  Droplet, 
  Zap, 
  Sparkles, 
  Gem, 
  Radio, 
  Atom, 
  Compass, 
  Crown 
} from 'lucide-react';
import { ElementCell, ELEMENT_SYMBOLS } from './superElementsTypes';

interface SuperElementsSymbolViewProps {
  cell: ElementCell;
}

export const SuperElementsSymbolView: React.FC<SuperElementsSymbolViewProps> = ({ cell }) => {
  const config = ELEMENT_SYMBOLS[cell.type];

  // Symbol Icon rendering
  const renderIcon = () => {
    switch (cell.type) {
      case 'fire':
        return (
          <div className="relative flex items-center justify-center">
            <Flame className="w-8 h-8 md:w-9 md:h-9 text-red-500 fill-orange-500 animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
            <div className="absolute inset-0 bg-red-500/20 blur-md rounded-full pointer-events-none" />
          </div>
        );
      case 'ice':
        return (
          <div className="relative flex items-center justify-center">
            <Droplet className="w-8 h-8 md:w-9 md:h-9 text-cyan-400 fill-sky-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full pointer-events-none" />
          </div>
        );
      case 'plasma':
        return (
          <div className="relative flex items-center justify-center">
            <Zap className="w-8 h-8 md:w-9 md:h-9 text-yellow-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]" />
            <div className="absolute inset-0 bg-yellow-400/20 blur-md rounded-full pointer-events-none" />
          </div>
        );
      case 'earth':
        return (
          <div className="relative flex items-center justify-center">
            <Gem className="w-8 h-8 md:w-9 md:h-9 text-emerald-400 fill-teal-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
            <div className="absolute inset-0 bg-emerald-400/20 blur-md rounded-full pointer-events-none" />
          </div>
        );
      case 'ace':
        return (
          <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
            A
          </span>
        );
      case 'king':
        return (
          <span className="text-2xl md:text-3xl font-black text-purple-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
            K
          </span>
        );
      case 'queen':
        return (
          <span className="text-2xl md:text-3xl font-black text-blue-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
            Q
          </span>
        );
      case 'jack':
        return (
          <span className="text-2xl md:text-3xl font-black text-teal-400 font-mono tracking-tighter drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]">
            J
          </span>
        );
      case 'wild':
        return (
          <div className="flex flex-col items-center justify-center scale-105">
            <Atom className="w-7 h-7 md:w-8 md:h-8 text-rose-400 animate-spin fill-rose-500/40 drop-shadow-[0_0_14px_rgba(244,63,94,1)]" style={{ animationDuration: '4s' }} />
            <span className="text-[10px] md:text-xs font-black tracking-widest text-rose-300 drop-shadow-[0_0_8px_#f43f5e] uppercase mt-0.5">
              WILD
            </span>
          </div>
        );
      case 'scatter':
        return (
          <div className="flex flex-col items-center justify-center animate-bounce">
            <Radio className="w-7 h-7 md:w-8 md:h-8 text-sky-300 fill-cyan-500/50 drop-shadow-[0_0_16px_rgba(56,189,248,1)]" />
            <span className="text-[9px] md:text-[10px] font-black tracking-wider text-cyan-200 drop-shadow-[0_0_8px_#38bdf8] uppercase mt-0.5">
              BONUS
            </span>
          </div>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-12 md:h-16 rounded-lg flex items-center justify-center transition-all duration-300 select-none overflow-hidden
        ${cell.isEliminating ? 'scale-0 opacity-0 rotate-12 bg-red-500' : 'scale-100 opacity-100'}
        ${cell.winHighlight ? 'ring-2 ring-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.8)] z-10' : ''}
        ${cell.isGolden 
          ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-500/20 via-yellow-950/50 to-amber-950/70 shadow-[inset_0_0_10px_rgba(245,158,11,0.5)]' 
          : 'border border-cyan-900/40 bg-slate-950/80 shadow-[inset_0_0_8px_rgba(0,0,0,0.8)]'
        }
        ${cell.isWildFromGolden ? 'ring-2 ring-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse' : ''}
      `}
    >
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${config.glowColor} 0%, transparent 70%)`
        }}
      />

      {/* Golden border aura badge */}
      {cell.isGolden && (
        <div className="absolute top-0.5 right-1 text-[8px] font-mono font-bold text-amber-300 bg-amber-950/90 px-1 rounded border border-amber-400/60 shadow-sm">
          GOLD
        </div>
      )}

      {/* Wild transform badge */}
      {cell.isWildFromGolden && (
        <div className="absolute top-0.5 left-1 text-[8px] font-mono font-bold text-rose-300 bg-rose-950/90 px-1 rounded border border-rose-500/60 shadow-sm">
          NEW
        </div>
      )}

      {/* Render inner icon */}
      <div className="relative z-10 flex items-center justify-center">
        {renderIcon()}
      </div>
    </div>
  );
};
