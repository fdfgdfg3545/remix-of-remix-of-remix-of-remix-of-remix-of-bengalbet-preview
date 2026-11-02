// @ts-nocheck
export type PinataSymbolType =
  | 'donkey'
  | 'skull'
  | 'maracas'
  | 'taco'
  | 'guitar'
  | 'a'
  | 'k'
  | 'q'
  | 'j'
  | 'wild'
  | 'scatter';

export interface PinataCell {
  id: string;
  type: PinataSymbolType;
  isGoldFramed?: boolean; // Reel 2, 3, 4 gold frame symbols
  pinataMultiplier?: number; // 2x, 3x, 5x, 10x, 20x, 50x, 100x
  isEliminating?: boolean;
  winHighlight?: boolean;
}

export interface PinataPaylineWin {
  symbol: PinataSymbolType;
  lineIndex: number;
  count: number;
  positions: { col: number; row: number }[];
  payout: number;
}

export interface PinataSymbolMeta {
  type: PinataSymbolType;
  nameEn: string;
  nameBn: string;
  color: string;
  glow: string;
  payouts: Record<number, number>; // 3, 4, 5
}

export const PINATA_SYMBOLS_META: Record<PinataSymbolType, PinataSymbolMeta> = {
  donkey: {
    type: 'donkey',
    nameEn: 'Fiesta Piñata',
    nameBn: 'উৎসবের পিনাটা',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.8)',
    payouts: { 3: 4.0, 4: 12.0, 5: 40.0 }
  },
  skull: {
    type: 'skull',
    nameEn: 'Sugar Skull',
    nameBn: 'সুগার স্কাল',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.8)',
    payouts: { 3: 3.0, 4: 8.0, 5: 25.0 }
  },
  maracas: {
    type: 'maracas',
    nameEn: 'Fiesta Maracas',
    nameBn: 'ম্যারাকাস বাদ্যযন্ত্র',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.8)',
    payouts: { 3: 2.0, 4: 6.0, 5: 18.0 }
  },
  taco: {
    type: 'taco',
    nameEn: 'Spicy Taco',
    nameBn: 'মশলাদার টাকো',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.7)',
    payouts: { 3: 1.5, 4: 4.5, 5: 14.0 }
  },
  guitar: {
    type: 'guitar',
    nameEn: 'Mariachi Guitar',
    nameBn: 'মারিয়াচি গিটার',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.7)',
    payouts: { 3: 1.2, 4: 3.5, 5: 10.0 }
  },
  a: {
    type: 'a',
    nameEn: 'Festive A',
    nameBn: 'রঙিন A',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.5)',
    payouts: { 3: 0.8, 4: 1.8, 5: 5.0 }
  },
  k: {
    type: 'k',
    nameEn: 'Festive K',
    nameBn: 'রঙিন K',
    color: '#fb923c',
    glow: 'rgba(251, 146, 60, 0.5)',
    payouts: { 3: 0.6, 4: 1.5, 5: 4.0 }
  },
  q: {
    type: 'q',
    nameEn: 'Festive Q',
    nameBn: 'রঙিন Q',
    color: '#facc15',
    glow: 'rgba(250, 204, 21, 0.5)',
    payouts: { 3: 0.5, 4: 1.2, 5: 3.0 }
  },
  j: {
    type: 'j',
    nameEn: 'Festive J',
    nameBn: 'রঙিন J',
    color: '#2dd4bf',
    glow: 'rgba(45, 212, 191, 0.5)',
    payouts: { 3: 0.4, 4: 1.0, 5: 2.5 }
  },
  wild: {
    type: 'wild',
    nameEn: 'Fiesta Star Wild',
    nameBn: 'উৎসবের তারা ওয়াইল্ড',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.9)',
    payouts: {}
  },
  scatter: {
    type: 'scatter',
    nameEn: 'Golden Piñata Scatter',
    nameBn: 'সোনার পিনাটা স্ক্যাটার',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.9)',
    payouts: {}
  }
};

export const YOUTUBE_VIDEO_PINATA = {
  url: 'https://www.youtube.com/watch?v=SttrMHo2Yic',
  embedUrl: 'https://www.youtube-nocookie.com/embed/SttrMHo2Yic?autoplay=1&rel=0',
  title: 'Pinata Wins : My Subscriber Requested Video🥰',
  channel: 'NexusOrbit'
};
