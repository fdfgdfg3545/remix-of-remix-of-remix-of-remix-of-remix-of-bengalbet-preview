// @ts-nocheck
export type AnubisSymbolType =
  | 'anubis'
  | 'scarab'
  | 'eye'
  | 'ankh'
  | 'bastet'
  | 'a'
  | 'k'
  | 'q'
  | 'j'
  | 'wild'
  | 'scatter';

export interface AnubisCell {
  id: string;
  type: AnubisSymbolType;
  isWrathCharged?: boolean;
  isEliminating?: boolean;
  isNew?: boolean;
  winHighlight?: boolean;
}

export interface AnubisWinLine {
  symbol: AnubisSymbolType;
  count: number;
  positions: { col: number; row: number }[];
  payout: number;
}

export interface AnubisSpinResult {
  grid: AnubisCell[][]; // 5 columns x 4 rows
  winningLines: AnubisWinLine[];
  baseWin: number;
  multiplier: number;
  totalWin: number;
  scatterCount: number;
  triggeredFreeSpins: boolean;
  isWrathActive: boolean;
}

export interface AnubisSymbolMeta {
  type: AnubisSymbolType;
  nameEn: string;
  nameBn: string;
  color: string;
  glow: string;
  payouts: Record<number, number>; // 3, 4, 5
}

export const ANUBIS_SYMBOLS_META: Record<AnubisSymbolType, AnubisSymbolMeta> = {
  anubis: {
    type: 'anubis',
    nameEn: 'Wrath of Anubis',
    nameBn: 'আনুবিসের ক্রোধ',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.8)',
    payouts: { 3: 5.0, 4: 15.0, 5: 50.0 }
  },
  scarab: {
    type: 'scarab',
    nameEn: 'Golden Scarab',
    nameBn: 'সোনার গুবরেপোকা',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.8)',
    payouts: { 3: 3.5, 4: 8.0, 5: 25.0 }
  },
  eye: {
    type: 'eye',
    nameEn: 'Eye of Horus',
    nameBn: 'হোরাস চক্ষু',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.7)',
    payouts: { 3: 2.5, 4: 6.0, 5: 18.0 }
  },
  ankh: {
    type: 'ankh',
    nameEn: 'Golden Ankh',
    nameBn: 'সোনার আঙ্খ',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.7)',
    payouts: { 3: 2.0, 4: 4.5, 5: 12.0 }
  },
  bastet: {
    type: 'bastet',
    nameEn: 'Bastet Scepter',
    nameBn: 'বাস্টেট রাজদণ্ড',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.7)',
    payouts: { 3: 1.5, 4: 3.5, 5: 10.0 }
  },
  a: {
    type: 'a',
    nameEn: 'Royal A',
    nameBn: 'হায়ারোগ্লিফ A',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.5)',
    payouts: { 3: 0.8, 4: 1.8, 5: 5.0 }
  },
  k: {
    type: 'k',
    nameEn: 'Royal K',
    nameBn: 'হায়ারোগ্লিফ K',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.5)',
    payouts: { 3: 0.6, 4: 1.5, 5: 4.0 }
  },
  q: {
    type: 'q',
    nameEn: 'Royal Q',
    nameBn: 'হায়ারোগ্লিফ Q',
    color: '#eab308',
    glow: 'rgba(234, 179, 8, 0.5)',
    payouts: { 3: 0.5, 4: 1.2, 5: 3.0 }
  },
  j: {
    type: 'j',
    nameEn: 'Royal J',
    nameBn: 'হায়ারোগ্লিফ J',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.5)',
    payouts: { 3: 0.4, 4: 1.0, 5: 2.5 }
  },
  wild: {
    type: 'wild',
    nameEn: 'Pharaoh Wild',
    nameBn: 'ওয়াইল্ড ফারাও',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.9)',
    payouts: {}
  },
  scatter: {
    type: 'scatter',
    nameEn: 'Pyramid Scatter',
    nameBn: 'পিরামিড স্ক্যাটার',
    color: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.9)',
    payouts: {}
  }
};

export const YOUTUBE_VIDEO_ANUBIS = {
  url: 'https://www.youtube.com/watch?v=bEqdGU1MBzk',
  embedUrl: 'https://www.youtube-nocookie.com/embed/bEqdGU1MBzk?autoplay=1&rel=0',
  title: 'Anubis Wrath machine a sous | pgsoft | casino win part 1',
  channel: 'skull Game 7K'
};
