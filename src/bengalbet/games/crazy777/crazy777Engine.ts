// @ts-nocheck
import { 
  Crazy777SymbolType, 
  Crazy777SpecialType, 
  Crazy777Cell, 
  Crazy777SpecialCell, 
  Crazy777Win 
} from './crazy777Types';
import { gameEngine } from '../../services/gameEngine';

const REGULAR_WEIGHTS: { type: Crazy777SymbolType; weight: number }[] = [
  { type: 'single_bar', weight: 26 },
  { type: 'double_bar', weight: 19 },
  { type: 'triple_bar', weight: 14 },
  { type: 'bell', weight: 12 },
  { type: 'single_7', weight: 10 },
  { type: 'double_7', weight: 7 },
  { type: 'triple_7', weight: 4 },
  { type: 'blank', weight: 8 }
];

const SPECIAL_WEIGHTS: { type: Crazy777SpecialType; weight: number }[] = [
  { type: 'mult_2x', weight: 24 },
  { type: 'mult_5x', weight: 14 },
  { type: 'mult_10x', weight: 6 },
  { type: 'bonus_cash_1', weight: 16 }, // +5X
  { type: 'bonus_cash_2', weight: 8 },  // +20X
  { type: 'bonus_cash_3', weight: 3 },  // +50X
  { type: 'respin_1', weight: 12 },     // 1 respin
  { type: 'respin_2', weight: 6 },      // 2 respins
  { type: 'respin_5', weight: 2 },      // 5 respins
  { type: 'blank', weight: 9 }
];

export function getRandomRegularSymbol(): Crazy777SymbolType {
  const total = REGULAR_WEIGHTS.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of REGULAR_WEIGHTS) {
    if (rand < item.weight) return item.type;
    rand -= item.weight;
  }
  return 'single_bar';
}

export function getRandomSpecialSymbol(boost: boolean = false): Crazy777SpecialType {
  const pool = SPECIAL_WEIGHTS.map(item => {
    if (boost && item.type !== 'blank') {
      return { ...item, weight: item.weight * 2 };
    }
    return item;
  });
  const total = pool.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of pool) {
    if (rand < item.weight) return item.type;
    rand -= item.weight;
  }
  return 'mult_2x';
}

export function generateCrazy777Reels(forceBonus: boolean = false): {
  reels: Crazy777Cell[][]; // 3 reels x 3 rows (row 1 is center payline)
  specialReel: Crazy777SpecialCell[]; // 1 reel x 3 rows
} {
  const reels: Crazy777Cell[][] = [];
  for (let c = 0; c < 3; c++) {
    const col: Crazy777Cell[] = [];
    for (let r = 0; r < 3; r++) {
      col.push({
        id: `reel-${c}-row-${r}-${Date.now()}-${Math.random()}`,
        type: getRandomRegularSymbol()
      });
    }
    reels.push(col);
  }

  const specialReel: Crazy777SpecialCell[] = [];
  for (let r = 0; r < 3; r++) {
    specialReel.push({
      id: `special-row-${r}-${Date.now()}-${Math.random()}`,
      type: getRandomSpecialSymbol(forceBonus)
    });
  }

  const rtp = gameEngine.getEffectiveRtp('crazy-777', 'slot');

  if (forceBonus || rtp >= 100) {
    // Center payline gets triple 7 or high win
    reels[0][1].type = 'triple_7';
    reels[1][1].type = 'triple_7';
    reels[2][1].type = 'triple_7';
    specialReel[1].type = 'mult_10x';
  } else if (rtp <= 0) {
    // Guaranteed non-matching payline (0% RTP / drain)
    reels[0][1].type = 'single_7';
    reels[1][1].type = 'double_bar';
    reels[2][1].type = 'blank';
    specialReel[1].type = 'blank';
  }

  return { reels, specialReel };
}

// Evaluate center payline win in Crazy 777
export function evaluateCrazy777(
  reels: Crazy777Cell[][],
  specialReel: Crazy777SpecialCell[],
  betAmount: number
): Crazy777Win | null {
  const c0 = reels[0][1].type;
  const c1 = reels[1][1].type;
  const c2 = reels[2][1].type;
  const special = specialReel[1].type;

  // Check 3 of a kind
  let basePayoutRate = 0;
  let winType: Crazy777SymbolType | 'any_7' | 'any_bar' | null = null;
  let nameEn = '';
  let nameBn = '';

  if (c0 === 'triple_7' && c1 === 'triple_7' && c2 === 'triple_7') {
    basePayoutRate = 100;
    winType = 'triple_7';
    nameEn = 'TRIPLE 777 (RED)';
    nameBn = 'ট্রিপল ৭৭৭ (লাল)';
  } else if (c0 === 'double_7' && c1 === 'double_7' && c2 === 'double_7') {
    basePayoutRate = 40;
    winType = 'double_7';
    nameEn = 'DOUBLE 77 (ORANGE)';
    nameBn = 'ডাবল ৭৭ (কমলা)';
  } else if (c0 === 'single_7' && c1 === 'single_7' && c2 === 'single_7') {
    basePayoutRate = 20;
    winType = 'single_7';
    nameEn = 'SINGLE 7 (BLUE)';
    nameBn = 'সিঙ্গেল ৭ (নীল)';
  } else if (isAny7(c0) && isAny7(c1) && isAny7(c2)) {
    basePayoutRate = 10;
    winType = 'any_7';
    nameEn = 'ANY 3 SEVENS';
    nameBn = 'যেকোনো ৩টি ৭';
  } else if (c0 === 'bell' && c1 === 'bell' && c2 === 'bell') {
    basePayoutRate = 15;
    winType = 'bell';
    nameEn = 'GOLDEN BELLS';
    nameBn = 'স্বর্ণ ঘণ্টা';
  } else if (c0 === 'triple_bar' && c1 === 'triple_bar' && c2 === 'triple_bar') {
    basePayoutRate = 8;
    winType = 'triple_bar';
    nameEn = 'TRIPLE BAR';
    nameBn = 'ট্রিপল বার';
  } else if (c0 === 'double_bar' && c1 === 'double_bar' && c2 === 'double_bar') {
    basePayoutRate = 5;
    winType = 'double_bar';
    nameEn = 'DOUBLE BAR';
    nameBn = 'ডাবল বার';
  } else if (c0 === 'single_bar' && c1 === 'single_bar' && c2 === 'single_bar') {
    basePayoutRate = 2;
    winType = 'single_bar';
    nameEn = 'SINGLE BAR';
    nameBn = 'সিঙ্গেল বার';
  } else if (isAnyBar(c0) && isAnyBar(c1) && isAnyBar(c2)) {
    basePayoutRate = 1;
    winType = 'any_bar';
    nameEn = 'ANY 3 BARS';
    nameBn = 'যেকোনো ৩টি বার';
  }

  if (!winType || basePayoutRate === 0) {
    return null;
  }

  // Evaluate Special 4th Reel
  let multiplier = 1;
  let bonusCash = 0;
  let respinsAwarded = 0;

  switch (special) {
    case 'mult_2x':
      multiplier = 2;
      break;
    case 'mult_5x':
      multiplier = 5;
      break;
    case 'mult_10x':
      multiplier = 10;
      break;
    case 'bonus_cash_1':
      bonusCash = betAmount * 5;
      break;
    case 'bonus_cash_2':
      bonusCash = betAmount * 20;
      break;
    case 'bonus_cash_3':
      bonusCash = betAmount * 50;
      break;
    case 'respin_1':
      respinsAwarded = 1;
      break;
    case 'respin_2':
      respinsAwarded = 2;
      break;
    case 'respin_5':
      respinsAwarded = 5;
      break;
    default:
      break;
  }

  const baseCash = betAmount * basePayoutRate;
  const totalPayout = baseCash * multiplier + bonusCash;

  return {
    type: winType,
    nameEn,
    nameBn,
    basePayout: baseCash,
    multiplier,
    bonusCash,
    respinsAwarded,
    totalPayout
  };
}

function isAny7(t: Crazy777SymbolType): boolean {
  return t === 'triple_7' || t === 'double_7' || t === 'single_7';
}

function isAnyBar(t: Crazy777SymbolType): boolean {
  return t === 'triple_bar' || t === 'double_bar' || t === 'single_bar';
}
