// @ts-nocheck
export type SevenCoinsSymbolType =
  | 'seven'       // Triple Red 777
  | 'bell'        // Golden Bell
  | 'bar'         // Classic Golden BAR
  | 'watermelon'  // Watermelon
  | 'grapes'      // Grapes
  | 'plum'        // Plum
  | 'orange'      // Orange
  | 'cherry'      // Cherries
  | 'bonus_coin'  // Gold Coin (1x - 15x, Mini, Minor, Major)
  | 'collect_coin'; // Collect Coin (Reel 2)

export type JackpotTier = 'mini' | 'minor' | 'major' | 'grand';

export interface SevenCoinsCell {
  id: string;
  type: SevenCoinsSymbolType;
  coinValue?: number; // Multiplier of bet e.g. 1, 2, 5, 10, 15, 25 (mini), 50 (minor), 150 (major)
  jackpotTier?: JackpotTier;
  isWinning?: boolean;
}

export interface SevenCoinsPaylineWin {
  lineIndex: number;
  symbolType: SevenCoinsSymbolType;
  payout: number;
  coordinates: { col: number; row: number }[];
}

export const SEVEN_COINS_PAYLINES: number[][] = [
  [0, 0, 0], // Top row
  [1, 1, 1], // Center row
  [2, 2, 2], // Bottom row
  [0, 1, 2], // Diagonal down
  [2, 1, 0]  // Diagonal up
];

export const SEVEN_COINS_PAYOUTS: Record<SevenCoinsSymbolType, number> = {
  seven: 50,
  bell: 30,
  bar: 15,
  watermelon: 8,
  grapes: 5,
  plum: 3,
  orange: 2,
  cherry: 1,
  bonus_coin: 0,
  collect_coin: 0
};

export const YOUTUBE_VIDEO_777_COINS = {
  id: 'yYbPGNCS4zk',
  url: 'https://www.youtube.com/watch?v=yYbPGNCS4zk',
  embedUrl: 'https://www.youtube.com/embed/yYbPGNCS4zk?autoplay=1&rel=0',
  title: '777 Coins slot by 3 Oaks Gaming | Gameplay + Bonus Feature',
  author: 'IVSDb - Internet Video Slot Database'
};
