// @ts-nocheck
export type FortuneTreeSymbolType =
  | 'golden_tree'   // Golden Money Tree WILD (Top Symbol)
  | 'jin_chan'      // Golden 3-Legged Money Toad with Coin
  | 'sycee'         // Golden Yuanbao Ingot
  | 'jade_carp'     // Lucky Jade Koi Fish
  | 'red_lantern'   // Festive Red Lantern
  | 'ace'           // A
  | 'king'          // K
  | 'queen'         // Q
  | 'jack'          // J
  | 'scatter'       // Golden Fortune Pot ("BONUS")
  | 'red_packet';   // Red Envelope Hongbao

export interface FortuneTreeCell {
  id: string;
  type: FortuneTreeSymbolType;
  isWild?: boolean;
  multiplier?: number; // e.g. x2, x3, x5 when dropped from tree
  winHighlight?: boolean;
}

export interface FortuneTreeSymbolConfig {
  type: FortuneTreeSymbolType;
  nameEn: string;
  nameBn: string;
  color: string;
  glowColor: string;
  basePayouts: {
    3: number;
    4: number;
    5: number;
  };
}

export const FORTUNE_TREE_SYMBOLS: Record<FortuneTreeSymbolType, FortuneTreeSymbolConfig> = {
  golden_tree: {
    type: 'golden_tree',
    nameEn: 'GOLDEN MONEY TREE (WILD)',
    nameBn: 'স্বর্ণবৃক্ষ ওয়াইল্ড',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.95)',
    basePayouts: { 3: 5.0, 4: 15.0, 5: 50.0 }
  },
  jin_chan: {
    type: 'jin_chan',
    nameEn: 'Golden Money Toad',
    nameBn: 'সোনার মানি টোড',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.8)',
    basePayouts: { 3: 3.5, 4: 10.0, 5: 30.0 }
  },
  sycee: {
    type: 'sycee',
    nameEn: 'Golden Ingot (Sycee)',
    nameBn: 'সোনার ইনগট',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    basePayouts: { 3: 2.5, 4: 7.5, 5: 20.0 }
  },
  jade_carp: {
    type: 'jade_carp',
    nameEn: 'Jade Koi Fish',
    nameBn: 'জেড কই মাছ',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.8)',
    basePayouts: { 3: 2.0, 4: 5.0, 5: 15.0 }
  },
  red_lantern: {
    type: 'red_lantern',
    nameEn: 'Lucky Red Lantern',
    nameBn: 'লাল লণ্ঠন',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    basePayouts: { 3: 1.5, 4: 3.5, 5: 10.0 }
  },
  ace: {
    type: 'ace',
    nameEn: 'A',
    nameBn: 'A',
    color: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.5)',
    basePayouts: { 3: 0.8, 4: 2.0, 5: 5.0 }
  },
  king: {
    type: 'king',
    nameEn: 'K',
    nameBn: 'K',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    basePayouts: { 3: 0.6, 4: 1.5, 5: 4.0 }
  },
  queen: {
    type: 'queen',
    nameEn: 'Q',
    nameBn: 'Q',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    basePayouts: { 3: 0.5, 4: 1.2, 5: 3.0 }
  },
  jack: {
    type: 'jack',
    nameEn: 'J',
    nameBn: 'J',
    color: '#14b8a6',
    glowColor: 'rgba(20, 184, 166, 0.5)',
    basePayouts: { 3: 0.4, 4: 1.0, 5: 2.5 }
  },
  scatter: {
    type: 'scatter',
    nameEn: 'FORTUNE POT SCATTER',
    nameBn: 'ফরচুন পট স্কেটার',
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.95)',
    basePayouts: { 3: 0, 4: 0, 5: 0 }
  },
  red_packet: {
    type: 'red_packet',
    nameEn: 'RED PACKET HONGBAO',
    nameBn: 'লাল খাম হংবাও',
    color: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.95)',
    basePayouts: { 3: 0, 4: 0, 5: 0 }
  }
};

export const FORTUNE_TREE_COLS = 5;
export const FORTUNE_TREE_ROWS = 3;

// 30 Fixed Paylines for JILI Fortune Tree
export const FORTUNE_TREE_PAYLINES: number[][] = [
  // Line 1-5: Straight and gentle V
  [1, 1, 1, 1, 1], // Center
  [0, 0, 0, 0, 0], // Top
  [2, 2, 2, 2, 2], // Bottom
  [0, 1, 2, 1, 0], // V down
  [2, 1, 0, 1, 2], // V up
  // Line 6-10: Waves
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 2, 2, 2, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  // Line 11-15: Zigzags
  [1, 2, 1, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  // Line 16-20: Steps
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 2, 0, 2, 0],
  // Line 21-25: Asymmetric curves
  [2, 0, 2, 0, 2],
  [0, 1, 2, 2, 2],
  [2, 1, 0, 0, 0],
  [0, 0, 0, 1, 2],
  [2, 2, 2, 1, 0],
  // Line 26-30: Arches
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1],
  [0, 2, 2, 2, 0],
  [2, 0, 0, 0, 2],
  [0, 2, 1, 2, 0]
];

export interface FortuneTreePaylineWin {
  lineIndex: number;
  symbolType: FortuneTreeSymbolType;
  matchCount: number;
  payout: number;
  multiplier: number;
  coordinates: { col: number; row: number }[];
}

export const YOUTUBE_VIDEO_FORTUNE_TREE = {
  id: 'Ja9CBKaCbs4',
  url: 'https://www.youtube.com/watch?v=Ja9CBKaCbs4',
  embedUrl: 'https://www.youtube.com/embed/Ja9CBKaCbs4?autoplay=1&rel=0',
  title: 'Fortune Tree Slot jili games 15K Win #Rk games 24',
  author: 'RK Games24'
};
