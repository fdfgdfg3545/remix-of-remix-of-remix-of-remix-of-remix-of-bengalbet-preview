// @ts-nocheck
export type SymbolId = 'WILD' | 'RED_GEM' | 'BLUE_GEM' | 'GREEN_GEM' | 'ACE' | 'KING' | 'QUEEN' | 'JACK';

export interface SymbolConfig {
  id: SymbolId;
  name: string;
  nameBn: string;
  payout3: number; // 3 of a kind multiplier
  color: string;
  accentColor: string;
  glow: string;
  isWild: boolean;
}

export const FORTUNE_SYMBOLS: Record<SymbolId, SymbolConfig> = {
  WILD: {
    id: 'WILD',
    name: 'Garuda Wild',
    nameBn: 'গরুড়া ওয়াইল্ড',
    payout3: 25,
    color: '#F59E0B',
    accentColor: '#FEF08A',
    glow: 'rgba(245, 158, 11, 0.6)',
    isWild: true
  },
  RED_GEM: {
    id: 'RED_GEM',
    name: 'Ruby Gem',
    nameBn: 'রুবি জেম',
    payout3: 20,
    color: '#EF4444',
    accentColor: '#FCA5A5',
    glow: 'rgba(239, 68, 68, 0.6)',
    isWild: false
  },
  BLUE_GEM: {
    id: 'BLUE_GEM',
    name: 'Sapphire Gem',
    nameBn: 'স্যাফায়ার জেম',
    payout3: 15,
    color: '#3B82F6',
    accentColor: '#93C5FD',
    glow: 'rgba(59, 130, 246, 0.6)',
    isWild: false
  },
  GREEN_GEM: {
    id: 'GREEN_GEM',
    name: 'Emerald Gem',
    nameBn: 'পান্না জেম',
    payout3: 10,
    color: '#10B981',
    accentColor: '#6EE7B7',
    glow: 'rgba(16, 185, 129, 0.6)',
    isWild: false
  },
  ACE: {
    id: 'ACE',
    name: 'Ace',
    nameBn: 'টেক্কা (A)',
    payout3: 8,
    color: '#EAB308',
    accentColor: '#FEF08A',
    glow: 'rgba(234, 179, 8, 0.5)',
    isWild: false
  },
  KING: {
    id: 'KING',
    name: 'King',
    nameBn: 'রাজা (K)',
    payout3: 6,
    color: '#8B5CF6',
    accentColor: '#C4B5FD',
    glow: 'rgba(139, 92, 246, 0.5)',
    isWild: false
  },
  QUEEN: {
    id: 'QUEEN',
    name: 'Queen',
    nameBn: 'রানী (Q)',
    payout3: 5,
    color: '#EC4899',
    accentColor: '#F472B6',
    glow: 'rgba(236, 72, 153, 0.5)',
    isWild: false
  },
  JACK: {
    id: 'JACK',
    name: 'Jack',
    nameBn: 'গোলাম (J)',
    payout3: 2,
    color: '#06B6D4',
    accentColor: '#67E8F9',
    glow: 'rgba(6, 182, 212, 0.5)',
    isWild: false
  }
};

// 5 Fixed Paylines across 3x3 Grid
// Index 0: Top, 1: Middle, 2: Bottom
export interface PaylineDefinition {
  id: number;
  name: string;
  nameBn: string;
  coords: [number, number][]; // [row, col]
  color: string;
}

export const FORTUNE_PAYLINES: PaylineDefinition[] = [
  {
    id: 1,
    name: 'Middle Line',
    nameBn: 'মাঝের লাইন',
    coords: [[1, 0], [1, 1], [1, 2]],
    color: '#EAB308'
  },
  {
    id: 2,
    name: 'Top Line',
    nameBn: 'উপরের লাইন',
    coords: [[0, 0], [0, 1], [0, 2]],
    color: '#3B82F6'
  },
  {
    id: 3,
    name: 'Bottom Line',
    nameBn: 'নিচের লাইন',
    coords: [[2, 0], [2, 1], [2, 2]],
    color: '#10B981'
  },
  {
    id: 4,
    name: 'Diagonal Top-Left to Bottom-Right',
    nameBn: 'বাম থেকে ডানে কোণাকুণি',
    coords: [[0, 0], [1, 1], [2, 2]],
    color: '#EF4444'
  },
  {
    id: 5,
    name: 'Diagonal Bottom-Left to Top-Right',
    nameBn: 'বাম থেকে উপরে কোণাকুণি',
    coords: [[2, 0], [1, 1], [0, 2]],
    color: '#EC4899'
  }
];

export interface SlotCell {
  id: string;
  symbol: SymbolId;
  splitCount: 1 | 2 | 3; // 1 = standard, 2 = split 2x, 3 = split 3x
  isWinning?: boolean;
}

export type MultiplierReelItem = {
  type: 'multiplier' | 'wheel';
  value: number; // 1, 2, 3, 5, 10, 15, 20, or wheel bonus
};

export interface PaylineWin {
  lineId: number;
  symbol: SymbolId;
  baseMultiplier: number;
  splitFactor: number; // product of split counts along line
  reelMultiplier: number;
  totalMultiplier: number;
  winAmount: number;
  coords: [number, number][];
}

export interface SpinResult {
  grid: SlotCell[][]; // 3 rows x 3 cols
  multiplierReel: MultiplierReelItem[]; // 3 visible items on 4th reel (center item index 1 is active)
  activeMultiplier: MultiplierReelItem;
  wins: PaylineWin[];
  totalWin: number;
  hasWheelBonus: boolean;
}
