// @ts-nocheck
export type BoxingSymbolId = 
  | 'RED_BOXER' 
  | 'BLUE_BOXER' 
  | 'RED_GLOVES' 
  | 'BLUE_GLOVES' 
  | 'RED_SHORTS' 
  | 'BLUE_BOOTS' 
  | 'ACE' 
  | 'KING' 
  | 'QUEEN' 
  | 'JACK' 
  | 'WILD' 
  | 'SCATTER';

export interface BoxingSymbolConfig {
  id: BoxingSymbolId;
  name: string;
  nameBn: string;
  payout5: number; // 5 matching
  payout4: number; // 4 matching
  payout3: number; // 3 matching
  color: string;
  isWild: boolean;
  isScatter: boolean;
}

export const BOXING_SYMBOLS: Record<BoxingSymbolId, BoxingSymbolConfig> = {
  RED_BOXER: {
    id: 'RED_BOXER',
    name: 'Champion Boxer (Red)',
    nameBn: 'লাল চ্যাম্পিয়ন বক্সার',
    payout5: 10.0,
    payout4: 4.0,
    payout3: 1.5,
    color: '#EF4444',
    isWild: false,
    isScatter: false
  },
  BLUE_BOXER: {
    id: 'BLUE_BOXER',
    name: 'Contender Boxer (Blue)',
    nameBn: 'নীল বক্সার',
    payout5: 8.0,
    payout4: 3.0,
    payout3: 1.2,
    color: '#3B82F6',
    isWild: false,
    isScatter: false
  },
  RED_GLOVES: {
    id: 'RED_GLOVES',
    name: 'Red Boxing Gloves',
    nameBn: 'লাল গ্লাভস',
    payout5: 6.0,
    payout4: 2.0,
    payout3: 0.8,
    color: '#DC2626',
    isWild: false,
    isScatter: false
  },
  BLUE_GLOVES: {
    id: 'BLUE_GLOVES',
    name: 'Blue Boxing Gloves',
    nameBn: 'নীল গ্লাভস',
    payout5: 5.0,
    payout4: 1.8,
    payout3: 0.7,
    color: '#2563EB',
    isWild: false,
    isScatter: false
  },
  RED_SHORTS: {
    id: 'RED_SHORTS',
    name: 'Champion Shorts',
    nameBn: 'চ্যাম্পিয়ন শর্টস',
    payout5: 4.0,
    payout4: 1.5,
    payout3: 0.5,
    color: '#F87171',
    isWild: false,
    isScatter: false
  },
  BLUE_BOOTS: {
    id: 'BLUE_BOOTS',
    name: 'Boxing Boots',
    nameBn: 'বক্সিং বুট',
    payout5: 3.0,
    payout4: 1.2,
    payout3: 0.4,
    color: '#60A5FA',
    isWild: false,
    isScatter: false
  },
  ACE: {
    id: 'ACE',
    name: 'Ace',
    nameBn: 'টেক্কা (A)',
    payout5: 2.0,
    payout4: 0.8,
    payout3: 0.3,
    color: '#FBBF24',
    isWild: false,
    isScatter: false
  },
  KING: {
    id: 'KING',
    name: 'King',
    nameBn: 'রাজা (K)',
    payout5: 1.5,
    payout4: 0.6,
    payout3: 0.25,
    color: '#A78BFA',
    isWild: false,
    isScatter: false
  },
  QUEEN: {
    id: 'QUEEN',
    name: 'Queen',
    nameBn: 'রানী (Q)',
    payout5: 1.2,
    payout4: 0.5,
    payout3: 0.2,
    color: '#F472B6',
    isWild: false,
    isScatter: false
  },
  JACK: {
    id: 'JACK',
    name: 'Jack',
    nameBn: 'গোলাম (J)',
    payout5: 1.0,
    payout4: 0.4,
    payout3: 0.15,
    color: '#22D3EE',
    isWild: false,
    isScatter: false
  },
  WILD: {
    id: 'WILD',
    name: 'Championship Belt Wild',
    nameBn: 'চ্যাম্পিয়ন বেল্ট ওয়াইল্ড',
    payout5: 20.0,
    payout4: 8.0,
    payout3: 3.0,
    color: '#EAB308',
    isWild: true,
    isScatter: false
  },
  SCATTER: {
    id: 'SCATTER',
    name: 'Boxing Bell Scatter',
    nameBn: 'বক্সিং বেল স্ক্যাটার',
    payout5: 50.0,
    payout4: 10.0,
    payout3: 2.0,
    color: '#F59E0B',
    isWild: false,
    isScatter: true
  }
};

// 5x5 Grid Cell
export interface BoxingCell {
  id: string;
  symbol: BoxingSymbolId;
  isEliminated?: boolean;
  isWinning?: boolean;
  isExMatch?: boolean; // When ExMATCH is active in Title Match mode
}

export interface MatchWin {
  symbol: BoxingSymbolId;
  count: number;
  multiplier: number; // base payout multiplier
  comboMultiplier: number; // cascade multiplier (1x, 2x, 3x, 5x, 8x)
  totalWin: number;
  winningCoords: [number, number][]; // [row, col]
}

// Multiplier combo progression
export const BASE_MULTIPLIER_LADDER = [1, 2, 3, 5, 8];
export const FREE_SPINS_MULTIPLIER_LADDER = [2, 4, 6, 10, 16];
