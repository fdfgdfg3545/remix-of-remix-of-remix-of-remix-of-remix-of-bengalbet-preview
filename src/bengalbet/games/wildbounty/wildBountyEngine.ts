// @ts-nocheck
import { 
  BountyCell, 
  BountySymbolType, 
  BountyWaysWin, 
  BOUNTY_SYMBOLS, 
  REEL_ROW_COUNTS 
} from './wildBountyTypes';

const REGULAR_SYMBOLS: BountySymbolType[] = [
  'cowgirl',
  'revolver',
  'hat',
  'whiskey',
  'ace',
  'king',
  'queen',
  'jack'
];

let globalBountyIdCounter = 0;
const generateUniqueId = () => `bounty_${Date.now()}_${++globalBountyIdCounter}`;

// Initialize grid with 6 columns having rows [3, 4, 5, 5, 4, 3]
export const createInitialBountyGrid = (): BountyCell[][] => {
  const grid: BountyCell[][] = [];

  for (let c = 0; c < 6; c++) {
    const rowCount = REEL_ROW_COUNTS[c];
    const colCells: BountyCell[] = [];

    for (let r = 0; r < rowCount; r++) {
      const type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
      // Gold frame symbols appear on reels 3 and 4 (indices 2 and 3)
      const isGolden = (c === 2 || c === 3) && Math.random() < 0.2;

      colCells.push({
        id: generateUniqueId(),
        type,
        isGolden
      });
    }
    grid.push(colCells);
  }

  return grid;
};

// Generate fresh spin grid
export const generateBountySpinGrid = (isFreeSpins: boolean = false): BountyCell[][] => {
  const grid: BountyCell[][] = [];

  for (let c = 0; c < 6; c++) {
    const rowCount = REEL_ROW_COUNTS[c];
    const colCells: BountyCell[] = [];

    for (let r = 0; r < rowCount; r++) {
      let type: BountySymbolType;
      const rand = Math.random();

      // Scatters: Gold Ingot
      if (rand < 0.035 && !isFreeSpins) {
        type = 'scatter';
      } else if (rand < 0.06 && (c === 2 || c === 3)) {
        type = 'wild';
      } else {
        if (isFreeSpins) {
          // Boosted high-paying western symbols in free spins
          const highR = Math.random();
          if (highR < 0.25) type = 'cowgirl';
          else if (highR < 0.48) type = 'revolver';
          else if (highR < 0.68) type = 'hat';
          else if (highR < 0.82) type = 'whiskey';
          else {
            type = ['ace', 'king', 'queen', 'jack'][Math.floor(Math.random() * 4)] as BountySymbolType;
          }
        } else {
          type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
        }
      }

      // Gold frame can spawn on reels 3 and 4 (indices 2 & 3)
      const canBeGold = (c === 2 || c === 3) && type !== 'scatter' && type !== 'wild';
      const isGolden = canBeGold && Math.random() < (isFreeSpins ? 0.35 : 0.22);

      colCells.push({
        id: generateUniqueId(),
        type,
        isGolden,
        isNew: true
      });
    }
    grid.push(colCells);
  }

  return grid;
};

// Evaluate adjacent Ways wins (Left to right from Reel 1)
export const evaluateBountyWaysWins = (
  grid: BountyCell[][],
  betAmount: number
): { wins: BountyWaysWin[]; totalPayout: number } => {
  const wins: BountyWaysWin[] = [];
  let totalPayout = 0;

  for (const sym of REGULAR_SYMBOLS) {
    const countsPerCol: number[] = [];
    const matchedCoords: { col: number; row: number }[] = [];

    for (let c = 0; c < 6; c++) {
      let colMatches = 0;
      const rowCount = REEL_ROW_COUNTS[c];

      for (let r = 0; r < rowCount; r++) {
        const cell = grid[c][r];
        if (cell.type === sym || cell.type === 'wild') {
          colMatches++;
          matchedCoords.push({ col: c, row: r });
        }
      }

      if (colMatches > 0) {
        countsPerCol.push(colMatches);
      } else {
        break; // Ways must start at reel 1 and be contiguous
      }
    }

    const matchCount = countsPerCol.length;
    if (matchCount >= 3) {
      let ways = 1;
      for (let i = 0; i < matchCount; i++) {
        ways *= countsPerCol[i];
      }

      const validCoords = matchedCoords.filter(pt => pt.col < matchCount);
      const config = BOUNTY_SYMBOLS[sym];
      const payoutMultiplier = config.basePayouts[matchCount as 3 | 4 | 5 | 6] || 0;
      const payoutPerWay = (betAmount / 20) * payoutMultiplier;
      const totalWin = payoutPerWay * ways;

      if (totalWin > 0) {
        wins.push({
          symbolType: sym,
          matchCount,
          ways,
          payoutPerWay,
          totalWin,
          coordinates: validCoords
        });
        totalPayout += totalWin;
      }
    }
  }

  return { wins, totalPayout };
};

// Cascading mechanics:
// 1. Golden frame symbols involved in a win transform into WILD Star!
// 2. Non-golden winning symbols disappear and symbols cascade down.
export const cascadeBountyGrid = (
  grid: BountyCell[][],
  winningCoords: { col: number; row: number }[],
  isFreeSpins: boolean = false
): BountyCell[][] => {
  const coordSet = new Set(winningCoords.map(c => `${c.col},${c.row}`));
  const nextGrid: BountyCell[][] = [];

  for (let c = 0; c < 6; c++) {
    const targetRowCount = REEL_ROW_COUNTS[c];
    const remainingColCells: BountyCell[] = [];

    for (let r = targetRowCount - 1; r >= 0; r--) {
      const cell = grid[c][r];
      const isWinner = coordSet.has(`${c},${r}`);

      if (isWinner) {
        if (cell.isGolden) {
          // Signature PG Soft mechanic: Gold-framed winning symbol turns into WILD
          remainingColCells.unshift({
            id: generateUniqueId(),
            type: 'wild',
            isGolden: false,
            isWildFromGolden: true,
            isNew: false
          });
        }
      } else {
        remainingColCells.unshift({
          ...cell,
          isEliminating: false,
          isNew: false
        });
      }
    }

    // Fill empty upper positions
    while (remainingColCells.length < targetRowCount) {
      const type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
      const canBeGold = (c === 2 || c === 3) && type !== 'wild';
      const isGolden = canBeGold && Math.random() < (isFreeSpins ? 0.3 : 0.18);

      remainingColCells.unshift({
        id: generateUniqueId(),
        type,
        isGolden,
        isNew: true
      });
    }

    nextGrid.push(remainingColCells);
  }

  return nextGrid;
};

export const countBountyScatters = (grid: BountyCell[][]): number => {
  let count = 0;
  for (let c = 0; c < 6; c++) {
    const rowCount = REEL_ROW_COUNTS[c];
    for (let r = 0; r < rowCount; r++) {
      if (grid[c][r].type === 'scatter') {
        count++;
      }
    }
  }
  return count;
};
