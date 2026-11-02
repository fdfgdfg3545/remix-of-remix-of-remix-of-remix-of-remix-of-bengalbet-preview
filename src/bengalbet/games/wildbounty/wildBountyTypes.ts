// @ts-nocheck
export type BountySymbolType =
  | 'cowgirl'
  | 'revolver'
  | 'hat'
  | 'whiskey'
  | 'ace'
  | 'king'
  | 'queen'
  | 'jack'
  | 'wild'
  | 'scatter';

export interface BountyCell {
  id: string;
  type: BountySymbolType;
  isGolden: boolean; // Gold-framed symbol on reels 3 and 4
  isEliminating?: boolean;
  isNew?: boolean;
  isWildFromGolden?: boolean;
  winHighlight?: boolean;
}

export interface BountySymbolConfig {
  type: BountySymbolType;
  nameEn: string;
  nameBn: string;
  color: string;
  glowColor: string;
  basePayouts: {
    3: number;
    4: number;
    5: number;
    6: number;
  };
}

export const BOUNTY_SYMBOLS: Record<BountySymbolType, BountySymbolConfig> = {
  cowgirl: {
    type: 'cowgirl',
    nameEn: 'Bounty Cowgirl',
    nameBn: 'কাউগার্ল শিকারি',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.7)',
    basePayouts: { 3: 3.0, 4: 6.0, 5: 12.0, 6: 25.0 }
  },
  revolver: {
    type: 'revolver',
    nameEn: 'Dual Revolvers',
    nameBn: 'রিভলবার পিস্তল',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.6)',
    basePayouts: { 3: 2.0, 4: 4.0, 5: 8.0, 6: 15.0 }
  },
  hat: {
    type: 'hat',
    nameEn: 'Outlaw Hat',
    nameBn: 'কাউবয় টুপি',
    color: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.6)',
    basePayouts: { 3: 1.5, 4: 3.0, 5: 6.0, 6: 10.0 }
  },
  whiskey: {
    type: 'whiskey',
    nameEn: 'Saloon Whiskey',
    nameBn: 'সেলুন হুইস্কি',
    color: '#b45309',
    glowColor: 'rgba(180, 83, 9, 0.6)',
    basePayouts: { 3: 1.0, 4: 2.0, 5: 4.0, 6: 6.0 }
  },
  ace: {
    type: 'ace',
    nameEn: 'A',
    nameBn: 'A',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    basePayouts: { 3: 0.5, 4: 1.0, 5: 2.0, 6: 3.0 }
  },
  king: {
    type: 'king',
    nameEn: 'K',
    nameBn: 'K',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    basePayouts: { 3: 0.4, 4: 0.8, 5: 1.5, 6: 2.5 }
  },
  queen: {
    type: 'queen',
    nameEn: 'Q',
    nameBn: 'Q',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    basePayouts: { 3: 0.3, 4: 0.6, 5: 1.2, 6: 2.0 }
  },
  jack: {
    type: 'jack',
    nameEn: 'J',
    nameBn: 'J',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    basePayouts: { 3: 0.2, 4: 0.5, 5: 1.0, 6: 1.5 }
  },
  wild: {
    type: 'wild',
    nameEn: 'SHERIFF STAR WILD',
    nameBn: 'শেরিফ ওয়াইল্ড',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.9)',
    basePayouts: { 3: 0, 4: 0, 5: 0, 6: 0 }
  },
  scatter: {
    type: 'scatter',
    nameEn: 'GOLD INGOT SCATTER',
    nameBn: 'স্বর্ণ বার স্কেটার',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.9)',
    basePayouts: { 3: 0, 4: 0, 5: 0, 6: 0 }
  }
};

// 6 reels with authentic 3-4-5-5-4-3 row heights = 3,600 ways
export const REEL_ROW_COUNTS = [3, 4, 5, 5, 4, 3];

export interface BountyWaysWin {
  symbolType: BountySymbolType;
  matchCount: number; // 3 to 6
  ways: number;
  payoutPerWay: number;
  totalWin: number;
  coordinates: { col: number; row: number }[];
}
