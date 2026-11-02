// @ts-nocheck
export type MagicAceSymbolType =
  | 'ace_spades'
  | 'king_hearts'
  | 'queen_clubs'
  | 'jack_diamonds'
  | 'ten'
  | 'nine'
  | 'wild'
  | 'wild_lock'
  | 'scatter';

export interface MagicAceCard {
  id: string;
  type: MagicAceSymbolType;
  isGolden?: boolean; // Transforms to Wild / Wild Lock upon win
  isLocked?: boolean; // Wild Lock feature
  lockCount?: number; // Drops remaining while locked
  isWinning?: boolean;
}

export interface MagicAceWinLine {
  symbol: MagicAceSymbolType;
  count: number;
  ways: number;
  payout: number;
  nameEn: string;
  nameBn: string;
}

export interface MagicAceCascadeResult {
  grid: MagicAceCard[][]; // 5 reels x 4 rows
  wins: MagicAceWinLine[];
  stepMultiplier: number;
  stepWin: number;
  scatterCount: number;
  freeSpinsAwarded: number;
  newWildLocks: number;
}

export const YOUTUBE_VIDEO_MAGIC_ACE = {
  id: 'vShlShgl51A',
  url: 'https://www.youtube.com/watch?v=vShlShgl51A',
  embedUrl: 'https://www.youtube.com/embed/vShlShgl51A?autoplay=1&rel=0',
  title: 'MAGIC ACE WILD LOCK : FEATURES BUY TODAY & HIGHLIGHTS || JILI Games',
  author: 'NexusOrbit'
};
