// @ts-nocheck
export type CircusSymbolType =
  | 'ringmaster'  // Circus Ringmaster (highest regular)
  | 'lion'        // Performing Circus Lion
  | 'hat'         // Magic Top Hat
  | 'pins'        // Juggling Bowling Pins
  | 'popcorn'     // Carnival Popcorn
  | 'ace'         // Ace
  | 'king'        // King
  | 'queen'       // Queen
  | 'jack'        // Jack
  | 'ten'         // Ten
  | 'wild'        // Laughing Joker Wild
  | 'scatter';    // Circus Big Top Tent Scatter

export interface CircusCell {
  id: string;
  type: CircusSymbolType;
  isWinning?: boolean;
}

export interface CircusPayItem {
  type: CircusSymbolType;
  name: string;
  nameBn: string;
  emoji: string;
  color: string;
  bgGrad: string;
  payouts: [number, number, number, number]; // 3, 4, 5, 6 of a kind
}

export const CIRCUS_PAYTABLE: Record<CircusSymbolType, CircusPayItem> = {
  ringmaster: {
    type: 'ringmaster',
    name: 'Ringmaster',
    nameBn: 'রিংমাস্টার',
    emoji: '🎩🤵',
    color: '#ef4444',
    bgGrad: 'from-red-600 via-rose-700 to-amber-800',
    payouts: [15, 30, 50, 80]
  },
  lion: {
    type: 'lion',
    name: 'Circus Lion',
    nameBn: 'সার্কাস সিংহ',
    emoji: '🦁🔥',
    color: '#f59e0b',
    bgGrad: 'from-amber-500 to-orange-700',
    payouts: [12, 25, 40, 60]
  },
  hat: {
    type: 'hat',
    name: 'Magic Hat',
    nameBn: 'জাদুর টুপি',
    emoji: '🎩✨',
    color: '#a855f7',
    bgGrad: 'from-purple-600 to-indigo-800',
    payouts: [10, 20, 30, 50]
  },
  pins: {
    type: 'pins',
    name: 'Juggling Pins',
    nameBn: 'জগলিং পিন',
    emoji: '🎳',
    color: '#06b6d4',
    bgGrad: 'from-cyan-500 to-blue-700',
    payouts: [8, 15, 25, 40]
  },
  popcorn: {
    type: 'popcorn',
    name: 'Popcorn',
    nameBn: 'পপকর্ন',
    emoji: '🍿',
    color: '#eab308',
    bgGrad: 'from-yellow-500 to-amber-700',
    payouts: [6, 12, 20, 30]
  },
  ace: {
    type: 'ace',
    name: 'A',
    nameBn: 'A',
    emoji: '🅰️',
    color: '#f43f5e',
    bgGrad: 'from-rose-600 to-red-800',
    payouts: [3, 5, 8, 12]
  },
  king: {
    type: 'king',
    name: 'K',
    nameBn: 'K',
    emoji: '👑',
    color: '#ec4899',
    bgGrad: 'from-pink-600 to-rose-800',
    payouts: [3, 5, 8, 12]
  },
  queen: {
    type: 'queen',
    name: 'Q',
    nameBn: 'Q',
    emoji: '👸',
    color: '#8b5cf6',
    bgGrad: 'from-violet-600 to-purple-800',
    payouts: [2, 4, 6, 10]
  },
  jack: {
    type: 'jack',
    name: 'J',
    nameBn: 'J',
    emoji: '🃏',
    color: '#3b82f6',
    bgGrad: 'from-blue-600 to-indigo-800',
    payouts: [2, 4, 6, 10]
  },
  ten: {
    type: 'ten',
    name: '10',
    nameBn: '10',
    emoji: '🔟',
    color: '#64748b',
    bgGrad: 'from-slate-600 to-slate-800',
    payouts: [1, 2, 4, 8]
  },
  wild: {
    type: 'wild',
    name: 'Joker Wild',
    nameBn: 'জোকার ওয়াইল্ড',
    emoji: '🤡💎',
    color: '#f59e0b',
    bgGrad: 'from-amber-400 via-rose-500 to-purple-600',
    payouts: [0, 0, 0, 0]
  },
  scatter: {
    type: 'scatter',
    name: 'Big Top Scatter',
    nameBn: 'সার্কাস তাঁবু',
    emoji: '🎪',
    color: '#ef4444',
    bgGrad: 'from-red-500 via-yellow-400 to-red-600',
    payouts: [0, 0, 0, 0]
  }
};
