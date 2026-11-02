// @ts-nocheck
export type FishType =
  | 'clownfish'
  | 'puffer'
  | 'jellyfish'
  | 'lionfish'
  | 'swordfish'
  | 'hammerhead'
  | 'golden_turtle'
  | 'mega_octopus';

export interface FishSpeciesConfig {
  type: FishType;
  nameEn: string;
  nameBn: string;
  multiplier: number; // e.g. 2x, 5x, 15x, 60x, 300x - 950x
  health: number; // HP before captured
  speed: number;
  size: number; // radius in px
  color: string;
  glowColor: string;
  isBoss?: boolean;
}

export const FISH_SPECIES: Record<FishType, FishSpeciesConfig> = {
  clownfish: {
    type: 'clownfish',
    nameEn: 'Clownfish',
    nameBn: 'ক্লাউন ফিশ',
    multiplier: 2,
    health: 1,
    speed: 1.8,
    size: 20,
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.6)'
  },
  puffer: {
    type: 'puffer',
    nameEn: 'Pufferfish',
    nameBn: 'বেলুন মাছ',
    multiplier: 4,
    health: 2,
    speed: 1.4,
    size: 24,
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.6)'
  },
  jellyfish: {
    type: 'jellyfish',
    nameEn: 'Crystal Jellyfish',
    nameBn: 'জেলিফিশ',
    multiplier: 8,
    health: 3,
    speed: 1.1,
    size: 26,
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)'
  },
  lionfish: {
    type: 'lionfish',
    nameEn: 'Venom Lionfish',
    nameBn: 'লায়ন ফিশ',
    multiplier: 15,
    health: 5,
    speed: 1.3,
    size: 30,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.7)'
  },
  swordfish: {
    type: 'swordfish',
    nameEn: 'Blue Swordfish',
    nameBn: 'সোর্ডফিশ',
    multiplier: 30,
    health: 8,
    speed: 2.2,
    size: 36,
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.8)'
  },
  hammerhead: {
    type: 'hammerhead',
    nameEn: 'Golden Hammerhead',
    nameBn: 'হাতুড়ি হাঙর',
    multiplier: 60,
    health: 14,
    speed: 1.5,
    size: 42,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.8)'
  },
  golden_turtle: {
    type: 'golden_turtle',
    nameEn: 'Fortune Golden Turtle',
    nameBn: 'স্বর্ণ কচ্ছপ',
    multiplier: 120,
    health: 25,
    speed: 0.9,
    size: 48,
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.9)'
  },
  mega_octopus: {
    type: 'mega_octopus',
    nameEn: 'MEGA OCTOPUS (BOSS)',
    nameBn: 'মেগা অক্টোপাস (বস)',
    multiplier: 300, // Wheel can boost up to 950x
    health: 60,
    speed: 0.6,
    size: 70,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.95)',
    isBoss: true
  }
};

export interface ActiveFish {
  id: string;
  type: FishType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  currentHp: number;
  maxHp: number;
  angle: number;
  captured?: boolean;
}

export type WeaponType = 'standard' | 'torpedo' | 'laser';

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weapon: WeaponType;
  betValue: number;
  targetFishId?: string;
}

export interface FloatingCoin {
  id: string;
  x: number;
  y: number;
  amount: number;
  multiplier: number;
}
