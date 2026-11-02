// @ts-nocheck
export type MoneyComingNumber = 'blank' | '1' | '2' | '5' | '10' | '0' | '00' | '100';

export type MoneyComingSpecial =
  | 'blank'
  | 'mult_2x'
  | 'mult_5x'
  | 'mult_10x'
  | 'respin'
  | 'wheel_bonus';

export interface MoneyComingCell {
  id: string;
  value: MoneyComingNumber;
  isWin?: boolean;
}

export interface MoneyComingSpecialCell {
  id: string;
  value: MoneyComingSpecial;
  isWin?: boolean;
}

export interface MoneyComingSpinResult {
  reels: [MoneyComingCell[], MoneyComingCell[], MoneyComingCell[]];
  specialReel: MoneyComingSpecialCell[];
  paylineNumbers: [MoneyComingNumber, MoneyComingNumber, MoneyComingNumber];
  paylineSpecial: MoneyComingSpecial;
  formedNumber: number; // e.g. 1000, 50, 10, 0
  baseWin: number;
  multiplier: number;
  totalWin: number;
  hasRespin: boolean;
  hasWheelBonus: boolean;
}

export const YOUTUBE_VIDEO_MONEY_COMING = {
  id: 'cy92wafnFEM',
  url: 'https://www.youtube.com/watch?v=cy92wafnFEM',
  embedUrl: 'https://www.youtube.com/embed/cy92wafnFEM?autoplay=1&rel=0',
  title: '3 Money Coming Win Strategies that Work Online! || JILI Games',
  author: 'The Ultimate Explainer'
};
