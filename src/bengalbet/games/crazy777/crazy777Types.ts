// @ts-nocheck
export type Crazy777SymbolType =
  | 'triple_7'   // Red 777 (Highest payout)
  | 'double_7'   // Orange 77
  | 'single_7'   // Blue 7
  | 'triple_bar' // Triple Red BAR
  | 'double_bar' // Double Blue BAR
  | 'single_bar' // Single Green BAR
  | 'bell'       // Golden Bell
  | 'blank';     // Classic mechanical blank

export type Crazy777SpecialType =
  | 'mult_2x'      // 2X Multiplier on reel 1-3 win
  | 'mult_5x'      // 5X Multiplier on reel 1-3 win
  | 'mult_10x'     // 10X Multiplier on reel 1-3 win
  | 'bonus_cash_1' // Extra +5X bet
  | 'bonus_cash_2' // Extra +20X bet
  | 'bonus_cash_3' // Extra +50X bet
  | 'respin_1'     // 1 Respin
  | 'respin_2'     // 2 Respins
  | 'respin_5'     // 5 Respins!
  | 'blank';

export interface Crazy777Cell {
  id: string;
  type: Crazy777SymbolType;
  isWin?: boolean;
}

export interface Crazy777SpecialCell {
  id: string;
  type: Crazy777SpecialType;
  isWin?: boolean;
}

export interface Crazy777Win {
  type: Crazy777SymbolType | 'any_7' | 'any_bar';
  nameEn: string;
  nameBn: string;
  basePayout: number;
  multiplier: number;
  bonusCash: number;
  respinsAwarded: number;
  totalPayout: number;
}

export const YOUTUBE_VIDEO_CRAZY_777 = {
  id: 'H27uuoIDue4',
  url: 'https://www.youtube.com/watch?v=H27uuoIDue4',
  embedUrl: 'https://www.youtube.com/embed/H27uuoIDue4?autoplay=1&rel=0',
  title: 'Crazy 777 Slot Super Win Tips & Tricks || JILI Games',
  author: 'JILI games Lovers'
};
