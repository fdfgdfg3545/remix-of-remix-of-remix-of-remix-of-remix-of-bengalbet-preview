// @ts-nocheck
export type SweetSymbolType =
  | 'heart'       // Red heart candy
  | 'purple_sq'   // Purple candy
  | 'green_pent'  // Green candy
  | 'blue_oval'   // Blue candy
  | 'apple'       // Red apple
  | 'plum'        // Purple plum
  | 'watermelon'  // Watermelon slice
  | 'grape'       // Purple grapes
  | 'banana'      // Yellow banana
  | 'lollipop'    // Scatter Swirl Lollipop
  | 'bomb';       // Multiplier Bomb (Free Spins)

export interface SweetCell {
  id: string;
  type: SweetSymbolType;
  bombValue?: number; // 2x, 3x, 5x, 10x, 25x, 50x, 100x
  isWinning?: boolean;
}

export interface TumbleWinGroup {
  type: SweetSymbolType;
  count: number;
  payout: number;
}

export interface SweetPaytableItem {
  type: SweetSymbolType;
  name: string;
  nameBn: string;
  emoji: string;
  color: string;
  bgGrad: string;
  payouts: {
    min8: number;   // 8-9 matching symbols multiplier
    min10: number;  // 10-11 matching symbols multiplier
    min12: number;  // 12+ matching symbols multiplier
  };
}

export const SWEET_PAYTABLE: Record<SweetSymbolType, SweetPaytableItem> = {
  heart: {
    type: 'heart',
    name: 'Red Heart Candy',
    nameBn: 'লাল হৃদয় ক্যান্ডি',
    emoji: '❤️',
    color: '#ef4444',
    bgGrad: 'from-red-500 to-rose-700',
    payouts: { min8: 10, min10: 25, min12: 50 }
  },
  purple_sq: {
    type: 'purple_sq',
    name: 'Purple Candy',
    nameBn: 'বেগুনি মিষ্টি',
    emoji: '🍬',
    color: '#a855f7',
    bgGrad: 'from-purple-500 to-violet-700',
    payouts: { min8: 2.5, min10: 10, min12: 25 }
  },
  green_pent: {
    type: 'green_pent',
    name: 'Green Candy',
    nameBn: 'সবুজ মিষ্টি',
    emoji: '💎',
    color: '#10b981',
    bgGrad: 'from-emerald-500 to-teal-700',
    payouts: { min8: 2, min10: 5, min12: 15 }
  },
  blue_oval: {
    type: 'blue_oval',
    name: 'Blue Candy',
    nameBn: 'নীল মিষ্টি',
    emoji: '🔷',
    color: '#3b82f6',
    bgGrad: 'from-blue-500 to-indigo-700',
    payouts: { min8: 1.5, min10: 2, min12: 12 }
  },
  apple: {
    type: 'apple',
    name: 'Red Apple',
    nameBn: 'লাল আপেল',
    emoji: '🍎',
    color: '#dc2626',
    bgGrad: 'from-red-400 to-rose-600',
    payouts: { min8: 1, min10: 1.5, min12: 10 }
  },
  plum: {
    type: 'plum',
    name: 'Purple Plum',
    nameBn: 'আলুবোখারা',
    emoji: '🫐',
    color: '#9333ea',
    bgGrad: 'from-purple-400 to-indigo-600',
    payouts: { min8: 0.8, min10: 1.2, min12: 8 }
  },
  watermelon: {
    type: 'watermelon',
    name: 'Watermelon',
    nameBn: 'তরমুজ',
    emoji: '🍉',
    color: '#16a34a',
    bgGrad: 'from-green-500 to-emerald-700',
    payouts: { min8: 0.5, min10: 1, min12: 5 }
  },
  grape: {
    type: 'grape',
    name: 'Grapes',
    nameBn: 'আঙ্গুর',
    emoji: '🍇',
    color: '#7c3aed',
    bgGrad: 'from-purple-500 to-fuchsia-700',
    payouts: { min8: 0.4, min10: 0.9, min12: 4 }
  },
  banana: {
    type: 'banana',
    name: 'Banana',
    nameBn: 'কলা',
    emoji: '🍌',
    color: '#eab308',
    bgGrad: 'from-yellow-400 to-amber-600',
    payouts: { min8: 0.25, min10: 0.75, min12: 2 }
  },
  lollipop: {
    type: 'lollipop',
    name: 'Lollipop Scatter',
    nameBn: 'ললিপপ স্ক্যাটার',
    emoji: '🍭',
    color: '#ec4899',
    bgGrad: 'from-pink-500 via-rose-500 to-yellow-400',
    payouts: { min8: 3, min10: 5, min12: 100 }
  },
  bomb: {
    type: 'bomb',
    name: 'Candy Bomb Multiplier',
    nameBn: 'ক্যান্ডি মাল্টিপ্লায়ার বোমা',
    emoji: '💣',
    color: '#f59e0b',
    bgGrad: 'from-amber-400 via-red-500 to-pink-600',
    payouts: { min8: 0, min10: 0, min12: 0 }
  }
};
