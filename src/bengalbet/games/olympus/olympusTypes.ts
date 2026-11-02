// @ts-nocheck
export type OlympusSymbolType =
  | 'crown'       // Golden Crown (highest regular symbol)
  | 'hourglass'   // Ancient Hourglass
  | 'ring'        // Ruby Gold Ring
  | 'chalice'     // Golden Goblet Chalice
  | 'red_gem'     // Ruby Jewel
  | 'purple_gem'  // Amethyst Jewel
  | 'yellow_gem'  // Topaz Jewel
  | 'green_gem'   // Emerald Jewel
  | 'blue_gem'    // Sapphire Jewel
  | 'scatter'     // Mighty Zeus Scatter
  | 'multiplier'; // Zeus Multiplier Orb (2X - 500X)

export interface OlympusCell {
  id: string;
  type: OlympusSymbolType;
  multiplierValue?: number; // for multiplier orbs (e.g. 2, 5, 10, 25, 50, 100, 250, 500)
  isWinning?: boolean;
}

export interface OlympusPayItem {
  type: OlympusSymbolType;
  name: string;
  nameBn: string;
  emoji: string;
  color: string;
  bgGrad: string;
  // Payout multipliers for [8-9, 10-11, 12-30] matches anywhere
  payouts: [number, number, number];
}

export const OLYMPUS_PAYTABLE: Record<OlympusSymbolType, OlympusPayItem> = {
  crown: {
    type: 'crown',
    name: 'Golden Crown',
    nameBn: 'সোনার মুকুট',
    emoji: '👑',
    color: '#f59e0b',
    bgGrad: 'from-amber-400 via-yellow-500 to-amber-700',
    payouts: [10, 25, 50]
  },
  hourglass: {
    type: 'hourglass',
    name: 'Hourglass',
    nameBn: 'বালুঘড়ি',
    emoji: '⏳',
    color: '#3b82f6',
    bgGrad: 'from-blue-500 via-indigo-600 to-blue-800',
    payouts: [2.5, 10, 25]
  },
  ring: {
    type: 'ring',
    name: 'Ruby Ring',
    nameBn: 'রুবি আংটি',
    emoji: '💍',
    color: '#ec4899',
    bgGrad: 'from-pink-500 to-rose-700',
    payouts: [2, 5, 15]
  },
  chalice: {
    type: 'chalice',
    name: 'Golden Chalice',
    nameBn: 'স্বর্ণ পানপাত্র',
    emoji: '🏆',
    color: '#eab308',
    bgGrad: 'from-yellow-500 to-amber-800',
    payouts: [1.5, 2, 12]
  },
  red_gem: {
    type: 'red_gem',
    name: 'Red Gem',
    nameBn: 'লাল রত্ন',
    emoji: '💎',
    color: '#ef4444',
    bgGrad: 'from-red-500 to-rose-800',
    payouts: [1, 1.5, 10]
  },
  purple_gem: {
    type: 'purple_gem',
    name: 'Purple Gem',
    nameBn: 'বেগুনি রত্ন',
    emoji: '🔮',
    color: '#a855f7',
    bgGrad: 'from-purple-500 to-violet-800',
    payouts: [0.8, 1.2, 8]
  },
  yellow_gem: {
    type: 'yellow_gem',
    name: 'Yellow Gem',
    nameBn: 'হলুদ রত্ন',
    emoji: '🟡',
    color: '#eab308',
    bgGrad: 'from-yellow-400 to-amber-600',
    payouts: [0.5, 1, 5]
  },
  green_gem: {
    type: 'green_gem',
    name: 'Green Gem',
    nameBn: 'সবুজ রত্ন',
    emoji: '🟢',
    color: '#10b981',
    bgGrad: 'from-emerald-400 to-teal-700',
    payouts: [0.4, 0.9, 4]
  },
  blue_gem: {
    type: 'blue_gem',
    name: 'Blue Gem',
    nameBn: 'নীল রত্ন',
    emoji: '🔵',
    color: '#06b6d4',
    bgGrad: 'from-cyan-500 to-blue-700',
    payouts: [0.25, 0.75, 2]
  },
  scatter: {
    type: 'scatter',
    name: 'Zeus Scatter',
    nameBn: 'জিউস স্ক্যাটার',
    emoji: '⚡🏛️',
    color: '#f59e0b',
    bgGrad: 'from-yellow-300 via-amber-500 to-yellow-600',
    payouts: [3, 5, 100] // 4, 5, 6 scatters
  },
  multiplier: {
    type: 'multiplier',
    name: 'Zeus Multiplier Orb',
    nameBn: 'মাল্টিপ্লায়ার অর্ব',
    emoji: '☄️',
    color: '#ec4899',
    bgGrad: 'from-fuchsia-500 via-purple-600 to-pink-600',
    payouts: [0, 0, 0]
  }
};
