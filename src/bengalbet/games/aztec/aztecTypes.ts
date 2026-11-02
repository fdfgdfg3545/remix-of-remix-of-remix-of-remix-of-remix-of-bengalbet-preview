// @ts-nocheck
export type AztecSymbolType =
  | 'gold_mask'       // Golden Mask (highest paying)
  | 'pink_mask'       // Pink Aztec face
  | 'purple_mask'     // Purple Aztec carving
  | 'blue_mask'       // Blue idol
  | 'green_mask'      // Green idol
  | 'ace'             // Ace
  | 'king'            // King
  | 'queen'           // Queen
  | 'jack'            // Jack
  | 'ten'             // 10
  | 'wild'            // Aztec Princess Wild
  | 'scatter';        // Golden Temple Pyramid

export type FrameType = 'none' | 'silver' | 'gold';

export interface AztecCell {
  id: string;
  type: AztecSymbolType;
  frame: FrameType;
  isWinning?: boolean;
}

export interface AztecPayItem {
  type: AztecSymbolType;
  name: string;
  nameBn: string;
  emoji: string;
  color: string;
  bgGrad: string;
  payouts: [number, number, number, number]; // 3, 4, 5, 6 of a kind
}

export const AZTEC_PAYTABLE: Record<AztecSymbolType, AztecPayItem> = {
  gold_mask: {
    type: 'gold_mask',
    name: 'Golden Mask',
    nameBn: 'স্বর্ণ মুখোশ',
    emoji: '👺',
    color: '#eab308',
    bgGrad: 'from-amber-400 via-yellow-500 to-amber-700',
    payouts: [30, 40, 60, 80]
  },
  pink_mask: {
    type: 'pink_mask',
    name: 'Red Mask',
    nameBn: 'লাল মুখোশ',
    emoji: '👹',
    color: '#f43f5e',
    bgGrad: 'from-rose-500 to-red-700',
    payouts: [20, 25, 50, 70]
  },
  purple_mask: {
    type: 'purple_mask',
    name: 'Purple Mask',
    nameBn: 'বেগুনি মুখোশ',
    emoji: '🗿',
    color: '#a855f7',
    bgGrad: 'from-purple-500 to-violet-700',
    payouts: [10, 25, 40, 60]
  },
  blue_mask: {
    type: 'blue_mask',
    name: 'Blue Idol',
    nameBn: 'নীল মূর্তি',
    emoji: '🧿',
    color: '#3b82f6',
    bgGrad: 'from-blue-500 to-indigo-700',
    payouts: [8, 15, 20, 30]
  },
  green_mask: {
    type: 'green_mask',
    name: 'Green Idol',
    nameBn: 'সবুজ মূর্তি',
    emoji: '🐍',
    color: '#10b981',
    bgGrad: 'from-emerald-500 to-teal-700',
    payouts: [6, 10, 12, 15]
  },
  ace: {
    type: 'ace',
    name: 'A',
    nameBn: 'A',
    emoji: '🅰️',
    color: '#f59e0b',
    bgGrad: 'from-amber-600 to-yellow-800',
    payouts: [4, 6, 8, 10]
  },
  king: {
    type: 'king',
    name: 'K',
    nameBn: 'K',
    emoji: '👑',
    color: '#ec4899',
    bgGrad: 'from-pink-600 to-rose-800',
    payouts: [4, 6, 8, 10]
  },
  queen: {
    type: 'queen',
    name: 'Q',
    nameBn: 'Q',
    emoji: '👸',
    color: '#8b5cf6',
    bgGrad: 'from-violet-600 to-purple-800',
    payouts: [1, 2, 3, 4]
  },
  jack: {
    type: 'jack',
    name: 'J',
    nameBn: 'J',
    emoji: '🃏',
    color: '#06b6d4',
    bgGrad: 'from-cyan-600 to-blue-800',
    payouts: [1, 2, 3, 4]
  },
  ten: {
    type: 'ten',
    name: '10',
    nameBn: '10',
    emoji: '🔟',
    color: '#64748b',
    bgGrad: 'from-slate-600 to-slate-800',
    payouts: [1, 2, 3, 4]
  },
  wild: {
    type: 'wild',
    name: 'Aztec Princess Wild',
    nameBn: 'ওয়াইল্ড প্রিন্সেস',
    emoji: '👸✨',
    color: '#fbbf24',
    bgGrad: 'from-amber-400 via-rose-500 to-purple-600',
    payouts: [0, 0, 0, 0]
  },
  scatter: {
    type: 'scatter',
    name: 'Pyramid Scatter',
    nameBn: 'পিরামিড স্ক্যাটার',
    emoji: '🏛️',
    color: '#f59e0b',
    bgGrad: 'from-yellow-400 to-amber-600',
    payouts: [0, 0, 0, 0]
  }
};
