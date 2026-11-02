// @ts-nocheck
export type AlibabaSymbolType =
  | 'alibaba'        // Hero with turban and curved scimitar (Highest regular)
  | 'morgiana'       // Arabian princess/heroine
  | 'treasure_chest' // Golden chest brimming with rubies & emeralds
  | 'magic_carpet'   // Flying Persian carpet with gold tassels
  | 'scimitar'       // Jeweled Arabian dagger
  | 'ace'            // Arabian gilded A
  | 'king'           // Arabian gilded K
  | 'queen'          // Arabian gilded Q
  | 'jack'           // Arabian gilded J
  | 'ten'            // Arabian gilded 10
  | 'wild'           // Magic Genie Lamp (Golden Lamp)
  | 'scatter'        // "OPEN SESAME" Golden Cave Vault Door
  | 'cave_bonus';    // Magic Urn / Mystery Treasure Pot

export interface AlibabaCell {
  id: string;
  type: AlibabaSymbolType;
  isGolden?: boolean;
  isEliminating?: boolean;
  isNew?: boolean;
  winHighlight?: boolean;
  multiplier?: number; // Optional wild multiplier e.g. x2, x3
}

export interface AlibabaSymbolConfig {
  type: AlibabaSymbolType;
  nameEn: string;
  nameBn: string;
  color: string;
  glowColor: string;
  basePayouts: {
    3: number;
    4: number;
    5: number;
  };
}

export const ALIBABA_SYMBOLS: Record<AlibabaSymbolType, AlibabaSymbolConfig> = {
  alibaba: {
    type: 'alibaba',
    nameEn: 'Ali Baba',
    nameBn: 'আলী বাবা',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    basePayouts: { 3: 5.0, 4: 15.0, 5: 50.0 }
  },
  morgiana: {
    type: 'morgiana',
    nameEn: 'Morgiana',
    nameBn: 'মরজিয়ানা',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.8)',
    basePayouts: { 3: 3.0, 4: 10.0, 5: 35.0 }
  },
  treasure_chest: {
    type: 'treasure_chest',
    nameEn: 'Treasure Chest',
    nameBn: 'রত্নসম্ভার সিন্দুক',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.75)',
    basePayouts: { 3: 2.5, 4: 7.5, 5: 25.0 }
  },
  magic_carpet: {
    type: 'magic_carpet',
    nameEn: 'Magic Carpet',
    nameBn: 'উড়ন্ত গালিচা',
    color: '#8b5cf6',
    glowColor: 'rgba(139, 92, 246, 0.75)',
    basePayouts: { 3: 2.0, 4: 5.0, 5: 18.0 }
  },
  scimitar: {
    type: 'scimitar',
    nameEn: 'Golden Scimitar',
    nameBn: 'সোনার তলোয়ার',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.75)',
    basePayouts: { 3: 1.5, 4: 3.5, 5: 12.0 }
  },
  ace: {
    type: 'ace',
    nameEn: 'A',
    nameBn: 'A',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    basePayouts: { 3: 0.8, 4: 2.0, 5: 6.0 }
  },
  king: {
    type: 'king',
    nameEn: 'K',
    nameBn: 'K',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    basePayouts: { 3: 0.6, 4: 1.5, 5: 5.0 }
  },
  queen: {
    type: 'queen',
    nameEn: 'Q',
    nameBn: 'Q',
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    basePayouts: { 3: 0.5, 4: 1.2, 5: 4.0 }
  },
  jack: {
    type: 'jack',
    nameEn: 'J',
    nameBn: 'J',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    basePayouts: { 3: 0.4, 4: 1.0, 5: 3.0 }
  },
  ten: {
    type: 'ten',
    nameEn: '10',
    nameBn: '10',
    color: '#64748b',
    glowColor: 'rgba(100, 116, 139, 0.5)',
    basePayouts: { 3: 0.3, 4: 0.8, 5: 2.5 }
  },
  wild: {
    type: 'wild',
    nameEn: 'GENIE LAMP WILD',
    nameBn: 'জাদুর প্রদীপ ওয়াইল্ড',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.95)',
    basePayouts: { 3: 0, 4: 0, 5: 0 }
  },
  scatter: {
    type: 'scatter',
    nameEn: 'OPEN SESAME SCATTER',
    nameBn: 'ওপেন সিসিম স্কেটার',
    color: '#facc15',
    glowColor: 'rgba(250, 204, 21, 0.95)',
    basePayouts: { 3: 0, 4: 0, 5: 0 }
  },
  cave_bonus: {
    type: 'cave_bonus',
    nameEn: 'CAVE URN BONUS',
    nameBn: 'গুহার গুপ্তধন কলস',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.95)',
    basePayouts: { 3: 0, 4: 0, 5: 0 }
  }
};

// 5 reels x 4 rows
export const ALIBABA_COLS = 5;
export const ALIBABA_ROWS = 4;

export interface AlibabaWinWay {
  symbolType: AlibabaSymbolType;
  matchCount: number; // 3 to 5
  ways: number;
  payoutPerWay: number;
  totalWin: number;
  coordinates: { col: number; row: number }[];
}

export const YOUTUBE_VIDEO_ALIBABA = {
  id: 'f-oaBELcUg4',
  url: 'https://www.youtube.com/watch?v=f-oaBELcUg4',
  embedUrl: 'https://www.youtube.com/embed/f-oaBELcUg4?autoplay=1&rel=0',
  title: "PG Soft | Alibaba's Cave of Fortune | Main Game + Free Game",
  author: 'AceSlot'
};
