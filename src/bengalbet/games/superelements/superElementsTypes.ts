// @ts-nocheck
export type ElementSymbolType =
  | 'fire'
  | 'ice'
  | 'plasma'
  | 'earth'
  | 'ace'
  | 'king'
  | 'queen'
  | 'jack'
  | 'wild'
  | 'scatter';

export interface ElementCell {
  id: string;
  type: ElementSymbolType;
  isGolden: boolean; // Golden-framed symbol on reels 2 to 5
  isEliminating?: boolean;
  isNew?: boolean;
  isWildFromGolden?: boolean;
  winHighlight?: boolean;
}

export interface ElementSymbolConfig {
  type: ElementSymbolType;
  nameEn: string;
  nameBn: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  basePayouts: {
    3: number;
    4: number;
    5: number;
    6: number;
  };
}

export const ELEMENT_SYMBOLS: Record<ElementSymbolType, ElementSymbolConfig> = {
  fire: {
    type: 'fire',
    nameEn: 'Fire Core',
    nameBn: 'অগ্নি কোর',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    bgGradient: 'from-red-950/80 via-orange-900/60 to-red-900/80',
    basePayouts: { 3: 2.0, 4: 4.0, 5: 8.0, 6: 15.0 }
  },
  ice: {
    type: 'ice',
    nameEn: 'Ice Crystal',
    nameBn: 'বরফ স্ফটিক',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    bgGradient: 'from-cyan-950/80 via-sky-900/60 to-blue-900/80',
    basePayouts: { 3: 1.5, 4: 3.0, 5: 6.0, 6: 10.0 }
  },
  plasma: {
    type: 'plasma',
    nameEn: 'Plasma Spark',
    nameBn: 'প্লাজমা বিদ্যুৎ',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    bgGradient: 'from-amber-950/80 via-yellow-900/60 to-amber-900/80',
    basePayouts: { 3: 1.2, 4: 2.4, 5: 5.0, 6: 8.0 }
  },
  earth: {
    type: 'earth',
    nameEn: 'Gaia Earth',
    nameBn: 'পৃথিবী রত্ন',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    bgGradient: 'from-emerald-950/80 via-green-900/60 to-teal-900/80',
    basePayouts: { 3: 1.0, 4: 2.0, 5: 4.0, 6: 6.0 }
  },
  ace: {
    type: 'ace',
    nameEn: 'A',
    nameBn: 'A',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    bgGradient: 'from-slate-900 via-amber-950/40 to-slate-900',
    basePayouts: { 3: 0.5, 4: 1.0, 5: 2.0, 6: 3.0 }
  },
  king: {
    type: 'king',
    nameEn: 'K',
    nameBn: 'K',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    bgGradient: 'from-slate-900 via-purple-950/40 to-slate-900',
    basePayouts: { 3: 0.4, 4: 0.8, 5: 1.6, 6: 2.5 }
  },
  queen: {
    type: 'queen',
    nameEn: 'Q',
    nameBn: 'Q',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    bgGradient: 'from-slate-900 via-blue-950/40 to-slate-900',
    basePayouts: { 3: 0.3, 4: 0.6, 5: 1.2, 6: 2.0 }
  },
  jack: {
    type: 'jack',
    nameEn: 'J',
    nameBn: 'J',
    color: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.4)',
    bgGradient: 'from-slate-900 via-teal-950/40 to-slate-900',
    basePayouts: { 3: 0.2, 4: 0.5, 5: 1.0, 6: 1.5 }
  },
  wild: {
    type: 'wild',
    nameEn: 'WILD CORE',
    nameBn: 'ওয়াইল্ড কোর',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.8)',
    bgGradient: 'from-rose-950 via-fuchsia-900 to-amber-900',
    basePayouts: { 3: 0, 4: 0, 5: 0, 6: 0 }
  },
  scatter: {
    type: 'scatter',
    nameEn: 'FREE GAME',
    nameBn: 'ফ্রি গেম',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.8)',
    bgGradient: 'from-indigo-950 via-purple-900 to-cyan-900',
    basePayouts: { 3: 0, 4: 0, 5: 0, 6: 0 }
  }
};

export const BASE_MULTIPLIER_STEPS = [1, 2, 3, 5, 10];
export const FREE_SPINS_MULTIPLIER_STEPS = [2, 4, 6, 10, 20];

export interface WaysWin {
  symbolType: ElementSymbolType;
  matchCount: number; // 3, 4, 5, or 6 reels
  ways: number; // product of counts per consecutive reel
  payoutPerWay: number;
  totalWin: number;
  coordinates: { col: number; row: number }[];
}
