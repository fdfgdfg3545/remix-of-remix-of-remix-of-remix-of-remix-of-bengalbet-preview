// @ts-nocheck
import { 
  PinataCell, 
  PinataSymbolType, 
  PinataPaylineWin, 
  PINATA_SYMBOLS_META 
} from './pinataTypes';

// Standard 20 paylines for 5x3 slots
export const PINATA_PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Line 1: Middle row
  [0, 0, 0, 0, 0], // Line 2: Top row
  [2, 2, 2, 2, 2], // Line 3: Bottom row
  [0, 1, 2, 1, 0], // Line 4: V-shape
  [2, 1, 0, 1, 2], // Line 5: Inverted V
  [0, 0, 1, 2, 2], // Line 6
  [2, 2, 1, 0, 0], // Line 7
  [1, 2, 2, 2, 1], // Line 8
  [1, 0, 0, 0, 1], // Line 9
  [0, 1, 1, 1, 0], // Line 10
  [2, 1, 1, 1, 2], // Line 11
  [0, 1, 0, 1, 0], // Line 12
  [2, 1, 2, 1, 2], // Line 13
  [1, 0, 1, 0, 1], // Line 14
  [1, 2, 1, 2, 1], // Line 15
  [0, 0, 1, 0, 0], // Line 16
  [2, 2, 1, 2, 2], // Line 17
  [1, 1, 0, 1, 1], // Line 18
  [1, 1, 2, 1, 1], // Line 19
  [0, 2, 0, 2, 0]  // Line 20
];

const MULTIPLIER_POOL = [2, 3, 5, 10, 20, 50, 100];

const SYMBOL_WEIGHTS: { type: PinataSymbolType; weight: number }[] = [
  { type: 'donkey', weight: 4 },
  { type: 'skull', weight: 6 },
  { type: 'maracas', weight: 8 },
  { type: 'taco', weight: 10 },
  { type: 'guitar', weight: 12 },
  { type: 'a', weight: 16 },
  { type: 'k', weight: 18 },
  { type: 'q', weight: 20 },
  { type: 'j', weight: 22 },
  { type: 'wild', weight: 5 },
  { type: 'scatter', weight: 3 }
];

export function getRandomPinataSymbol(): PinataSymbolType {
  const total = SYMBOL_WEIGHTS.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of SYMBOL_WEIGHTS) {
    if (rand < item.weight) {
      return item.type;
    }
    rand -= item.weight;
  }
  return 'j';
}

export function generatePinataGrid(): PinataCell[][] {
  const grid: PinataCell[][] = [];
  for (let col = 0; col < 5; col++) {
    const column: PinataCell[] = [];
    for (let row = 0; row < 3; row++) {
      const type = getRandomPinataSymbol();
      // Gold frame can appear on reels 2, 3, 4 (col 1, 2, 3) for regular symbols
      const isEligibleGold = (col >= 1 && col <= 3) && (type !== 'wild' && type !== 'scatter');
      const isGoldFramed = isEligibleGold && Math.random() < 0.28;

      // Piñata multiplier star chance (approx 15%)
      const hasMultiplier = Math.random() < 0.15;
      const pinataMultiplier = hasMultiplier 
        ? MULTIPLIER_POOL[Math.floor(Math.random() * MULTIPLIER_POOL.length)] 
        : undefined;

      column.push({
        id: `c${col}-r${row}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type,
        isGoldFramed,
        pinataMultiplier
      });
    }
    grid.push(column);
  }
  return grid;
}

export function evaluatePinataWins(grid: PinataCell[][], betAmount: number): {
  winLines: PinataPaylineWin[];
  baseWin: number;
  multiplierSum: number;
  totalWin: number;
  scatterCount: number;
} {
  const winLines: PinataPaylineWin[] = [];
  const lineBet = betAmount / 20;

  PINATA_PAYLINES.forEach((linePattern, lineIndex) => {
    // Collect symbols along this line
    const lineSymbols: { type: PinataSymbolType; col: number; row: number }[] = [];
    for (let col = 0; col < 5; col++) {
      const row = linePattern[col];
      lineSymbols.push({ type: grid[col][row].type, col, row });
    }

    // Determine target symbol
    let matchSymbol: PinataSymbolType | null = null;
    for (const item of lineSymbols) {
      if (item.type !== 'wild' && item.type !== 'scatter') {
        matchSymbol = item.type;
        break;
      }
    }

    if (!matchSymbol) {
      // All wilds
      matchSymbol = 'donkey';
    }

    // Count consecutive matches from col 0
    let matchCount = 0;
    const positions: { col: number; row: number }[] = [];
    for (let col = 0; col < 5; col++) {
      const item = lineSymbols[col];
      if (item.type === matchSymbol || item.type === 'wild') {
        matchCount++;
        positions.push({ col: item.col, row: item.row });
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const meta = PINATA_SYMBOLS_META[matchSymbol];
      const payoutMultiplier = meta.payouts[matchCount] || 0;
      const payout = lineBet * payoutMultiplier;

      winLines.push({
        symbol: matchSymbol,
        lineIndex,
        count: matchCount,
        positions,
        payout
      });
    }
  });

  // Calculate Piñata Multipliers present on grid
  let multiplierSum = 0;
  let scatterCount = 0;

  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      const cell = grid[col][row];
      if (cell.type === 'scatter') {
        scatterCount++;
      }
      if (cell.pinataMultiplier) {
        multiplierSum += cell.pinataMultiplier;
      }
    }
  }

  // If no multiplier on grid, minimum multiplier is 1x
  if (multiplierSum === 0) {
    multiplierSum = 1;
  }

  const baseWin = winLines.reduce((acc, curr) => acc + curr.payout, 0);
  const totalWin = baseWin > 0 ? baseWin * multiplierSum : 0;

  return {
    winLines,
    baseWin,
    multiplierSum,
    totalWin,
    scatterCount
  };
}
