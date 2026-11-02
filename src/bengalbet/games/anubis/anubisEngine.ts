// @ts-nocheck
import { 
  AnubisCell, 
  AnubisSymbolType, 
  AnubisWinLine, 
  ANUBIS_SYMBOLS_META 
} from './anubisTypes';

const REGULAR_WEIGHTS: { type: AnubisSymbolType; weight: number }[] = [
  { type: 'anubis', weight: 4 },
  { type: 'scarab', weight: 7 },
  { type: 'eye', weight: 10 },
  { type: 'ankh', weight: 12 },
  { type: 'bastet', weight: 14 },
  { type: 'a', weight: 18 },
  { type: 'k', weight: 20 },
  { type: 'q', weight: 22 },
  { type: 'j', weight: 24 },
  { type: 'wild', weight: 6 },
  { type: 'scatter', weight: 4 }
];

export function getRandomAnubisSymbol(wrathMode: boolean = false): AnubisSymbolType {
  const weights = wrathMode 
    ? REGULAR_WEIGHTS.map(w => w.type === 'anubis' || w.type === 'wild' ? { ...w, weight: w.weight * 3 } : w)
    : REGULAR_WEIGHTS;

  const total = weights.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of weights) {
    if (rand < item.weight) {
      return item.type;
    }
    rand -= item.weight;
  }
  return 'j';
}

export function generateAnubisGrid(wrathMode: boolean = false): AnubisCell[][] {
  const grid: AnubisCell[][] = [];
  for (let col = 0; col < 5; col++) {
    const column: AnubisCell[] = [];
    for (let row = 0; row < 4; row++) {
      const type = getRandomAnubisSymbol(wrathMode);
      column.push({
        id: `c${col}-r${row}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type,
        isWrathCharged: wrathMode && (type === 'anubis' || type === 'wild')
      });
    }
    grid.push(column);
  }
  return grid;
}

export function evaluateAnubisWins(grid: AnubisCell[][], betAmount: number): {
  winLines: AnubisWinLine[];
  totalWin: number;
  scatterCount: number;
} {
  const winLines: AnubisWinLine[] = [];
  const symbolTypes: AnubisSymbolType[] = ['anubis', 'scarab', 'eye', 'ankh', 'bastet', 'a', 'k', 'q', 'j'];

  // Ways to win across 5 reels: Left to right
  for (const sym of symbolTypes) {
    const positionsPerReel: { col: number; row: number }[][] = [];

    for (let col = 0; col < 5; col++) {
      const matchesInCol: { col: number; row: number }[] = [];
      for (let row = 0; row < 4; row++) {
        const cell = grid[col][row];
        if (cell.type === sym || cell.type === 'wild') {
          matchesInCol.push({ col, row });
        }
      }
      if (matchesInCol.length > 0) {
        positionsPerReel.push(matchesInCol);
      } else {
        break; // Consecutive reels from left to right only
      }
    }

    const consecutiveReels = positionsPerReel.length;
    if (consecutiveReels >= 3) {
      // Calculate ways: product of count in each reel
      const waysCount = positionsPerReel.reduce((acc, curr) => acc * curr.length, 1);
      const meta = ANUBIS_SYMBOLS_META[sym];
      const payoutMultiplier = meta.payouts[consecutiveReels] || 0;

      // Flatten positions
      const allPositions = positionsPerReel.flat();
      const linePayout = (betAmount / 20) * payoutMultiplier * waysCount;

      winLines.push({
        symbol: sym,
        count: consecutiveReels,
        positions: allPositions,
        payout: linePayout
      });
    }
  }

  // Count Scatters
  let scatterCount = 0;
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 4; row++) {
      if (grid[col][row].type === 'scatter') {
        scatterCount++;
      }
    }
  }

  const totalWin = winLines.reduce((acc, curr) => acc + curr.payout, 0);

  return {
    winLines,
    totalWin,
    scatterCount
  };
}
