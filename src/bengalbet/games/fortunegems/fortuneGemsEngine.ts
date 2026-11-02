// @ts-nocheck
import { 
  SymbolId, 
  FORTUNE_SYMBOLS, 
  FORTUNE_PAYLINES, 
  SlotCell, 
  MultiplierReelItem, 
  PaylineWin, 
  SpinResult 
} from './fortuneGemsTypes';

// Symbol weights for RNG
const SYMBOL_WEIGHTS: { symbol: SymbolId; weight: number }[] = [
  { symbol: 'WILD', weight: 6 },
  { symbol: 'RED_GEM', weight: 12 },
  { symbol: 'BLUE_GEM', weight: 16 },
  { symbol: 'GREEN_GEM', weight: 20 },
  { symbol: 'ACE', weight: 26 },
  { symbol: 'KING', weight: 30 },
  { symbol: 'QUEEN', weight: 35 },
  { symbol: 'JACK', weight: 45 }
];

const TOTAL_SYMBOL_WEIGHT = SYMBOL_WEIGHTS.reduce((acc, curr) => acc + curr.weight, 0);

function getRandomSymbol(): SymbolId {
  let rand = Math.random() * TOTAL_SYMBOL_WEIGHT;
  for (const item of SYMBOL_WEIGHTS) {
    if (rand < item.weight) return item.symbol;
    rand -= item.weight;
  }
  return 'JACK';
}

// 4th Reel Multipliers
// Normal Mode: 1X (40%), 2X (25%), 3X (18%), 5X (10%), 10X (5%), 15X (1.5%), Wheel (0.5%)
// Extra Bet Mode: 1X removed! 2X (35%), 3X (25%), 5X (20%), 10X (12%), 15X (5%), 20X (2%), Wheel (1%)
function getRandomMultiplierItem(extraBet: boolean): MultiplierReelItem {
  const rand = Math.random() * 100;
  if (!extraBet) {
    if (rand < 38) return { type: 'multiplier', value: 1 };
    if (rand < 63) return { type: 'multiplier', value: 2 };
    if (rand < 80) return { type: 'multiplier', value: 3 };
    if (rand < 90) return { type: 'multiplier', value: 5 };
    if (rand < 96.5) return { type: 'multiplier', value: 10 };
    if (rand < 99) return { type: 'multiplier', value: 15 };
    return { type: 'wheel', value: 100 };
  } else {
    // Extra Bet mode: NO 1X!
    if (rand < 35) return { type: 'multiplier', value: 2 };
    if (rand < 60) return { type: 'multiplier', value: 3 };
    if (rand < 78) return { type: 'multiplier', value: 5 };
    if (rand < 90) return { type: 'multiplier', value: 10 };
    if (rand < 96) return { type: 'multiplier', value: 15 };
    if (rand < 98.5) return { type: 'multiplier', value: 20 };
    return { type: 'wheel', value: 100 };
  }
}

// Split count generation:
// Normal: 1x (82%), 2x (14%), 3x (4%)
// Extra Bet: 1x (52%), 2x (34%), 3x (14%)
function getRandomSplitCount(extraBet: boolean): 1 | 2 | 3 {
  const rand = Math.random() * 100;
  if (extraBet) {
    if (rand < 52) return 1;
    if (rand < 86) return 2;
    return 3;
  } else {
    if (rand < 82) return 1;
    if (rand < 96) return 2;
    return 3;
  }
}

export function generateSpinResult(
  baseBet: number,
  extraBet: boolean,
  forceWin?: boolean,
  forceWheel?: boolean
): SpinResult {
  // Generate 3x3 Grid
  const grid: SlotCell[][] = [];
  for (let r = 0; r < 3; r++) {
    const row: SlotCell[] = [];
    for (let c = 0; c < 3; c++) {
      row.push({
        id: `cell-${r}-${c}-${Date.now()}-${Math.random()}`,
        symbol: getRandomSymbol(),
        splitCount: getRandomSplitCount(extraBet),
        isWinning: false
      });
    }
    grid.push(row);
  }

  // Generate 4th Reel (3 visible items, index 1 is center active pointer)
  const multReel: MultiplierReelItem[] = [
    getRandomMultiplierItem(extraBet),
    forceWheel ? { type: 'wheel', value: 100 } : getRandomMultiplierItem(extraBet),
    getRandomMultiplierItem(extraBet)
  ];
  const activeMultiplier = multReel[1];

  // If forceWin requested (e.g. for demonstration or demo balance win boost)
  if (forceWin) {
    const winSym: SymbolId = Math.random() > 0.4 ? 'RED_GEM' : 'WILD';
    grid[1][0].symbol = winSym;
    grid[1][1].symbol = winSym;
    grid[1][2].symbol = winSym;
    grid[1][0].splitCount = 2;
    grid[1][2].splitCount = 2;
  }

  // Evaluate the 5 fixed paylines
  const wins: PaylineWin[] = [];
  const lineBet = baseBet / 5; // Bet divided equally across 5 lines

  for (const line of FORTUNE_PAYLINES) {
    const [c0, c1, c2] = line.coords;
    const cell0 = grid[c0[0]][c0[1]];
    const cell1 = grid[c1[0]][c1[1]];
    const cell2 = grid[c2[0]][c2[1]];

    // Check if line forms a 3-of-a-kind with WILD substitution
    let matchSymbol: SymbolId | null = null;
    
    const symbols = [cell0.symbol, cell1.symbol, cell2.symbol];
    const nonWilds = symbols.filter(s => s !== 'WILD');

    if (nonWilds.length === 0) {
      // All 3 are WILD!
      matchSymbol = 'WILD';
    } else {
      const candidate = nonWilds[0];
      const allMatchCandidateOrWild = symbols.every(s => s === candidate || s === 'WILD');
      if (allMatchCandidateOrWild) {
        matchSymbol = candidate;
      }
    }

    if (matchSymbol) {
      // Mark winning cells
      cell0.isWinning = true;
      cell1.isWinning = true;
      cell2.isWinning = true;

      const symConfig = FORTUNE_SYMBOLS[matchSymbol];
      const baseMultiplier = symConfig.payout3;

      // Fortune Gems 3 Split Multiplication mechanic!
      const splitFactor = cell0.splitCount * cell1.splitCount * cell2.splitCount;

      const reelMultValue = activeMultiplier.type === 'multiplier' ? activeMultiplier.value : 1;
      const totalMultiplier = baseMultiplier * splitFactor * reelMultValue;
      const winAmount = lineBet * totalMultiplier;

      wins.push({
        lineId: line.id,
        symbol: matchSymbol,
        baseMultiplier,
        splitFactor,
        reelMultiplier: reelMultValue,
        totalMultiplier,
        winAmount,
        coords: line.coords
      });
    }
  }

  const totalWin = wins.reduce((acc, w) => acc + w.winAmount, 0);

  return {
    grid,
    multiplierReel: multReel,
    activeMultiplier,
    wins,
    totalWin,
    hasWheelBonus: activeMultiplier.type === 'wheel'
  };
}

// Fortune Wheel Multipliers
export const FORTUNE_WHEEL_SLICES = [
  { multiplier: 50, label: '50X', color: '#3B82F6', text: '#FFFFFF' },
  { multiplier: 100, label: '100X', color: '#8B5CF6', text: '#FFFFFF' },
  { multiplier: 80, label: '80X', color: '#10B981', text: '#FFFFFF' },
  { multiplier: 200, label: '200X', color: '#F59E0B', text: '#000000' },
  { multiplier: 60, label: '60X', color: '#EC4899', text: '#FFFFFF' },
  { multiplier: 300, label: '300X', color: '#EF4444', text: '#FFFFFF' },
  { multiplier: 150, label: '150X', color: '#06B6D4', text: '#FFFFFF' },
  { multiplier: 1000, label: '1000X', color: '#FACC15', text: '#000000', isJackpot: true }
];
