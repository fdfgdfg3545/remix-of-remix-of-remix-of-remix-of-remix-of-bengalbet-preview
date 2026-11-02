// @ts-nocheck
import { 
  ElementCell, 
  ElementSymbolType, 
  WaysWin, 
  ELEMENT_SYMBOLS 
} from './superElementsTypes';

const REGULAR_SYMBOLS: ElementSymbolType[] = [
  'fire',
  'ice',
  'plasma',
  'earth',
  'ace',
  'king',
  'queen',
  'jack'
];

let globalCellCounter = 0;
const generateUniqueId = () => `elem_${Date.now()}_${++globalCellCounter}`;

export const createInitialGrid = (): ElementCell[][] => {
  const cols = 6;
  const rows = 5;
  const grid: ElementCell[][] = [];

  for (let c = 0; c < cols; c++) {
    const colCells: ElementCell[] = [];
    for (let r = 0; r < rows; r++) {
      const type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
      // reels 2-5 can have golden frames
      const isGolden = c >= 1 && c <= 4 && Math.random() < 0.15;
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

export const generateSpinGrid = (isFreeSpins: boolean = false): ElementCell[][] => {
  const cols = 6;
  const rows = 5;
  const grid: ElementCell[][] = [];

  for (let c = 0; c < cols; c++) {
    const colCells: ElementCell[] = [];
    for (let r = 0; r < rows; r++) {
      let type: ElementSymbolType;
      const rand = Math.random();

      // In free spins, higher weight for high-tier elementals and wilds
      if (rand < 0.035 && !isFreeSpins) {
        type = 'scatter'; // Free Game reactor
      } else if (rand < 0.07 && c >= 1 && c <= 4) {
        type = 'wild';
      } else {
        if (isFreeSpins) {
          // Weight towards high-value elementals
          const highRand = Math.random();
          if (highRand < 0.22) type = 'fire';
          else if (highRand < 0.44) type = 'ice';
          else if (highRand < 0.64) type = 'plasma';
          else if (highRand < 0.80) type = 'earth';
          else {
            type = ['ace', 'king', 'queen', 'jack'][Math.floor(Math.random() * 4)] as ElementSymbolType;
          }
        } else {
          type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
        }
      }

      // Golden symbols appear on reels 2 to 5 (columns 1 to 4)
      const canBeGolden = c >= 1 && c <= 4 && type !== 'scatter' && type !== 'wild';
      const goldenChance = isFreeSpins ? 0.28 : 0.16;
      const isGolden = canBeGolden && Math.random() < goldenChance;

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

// Evaluate adjacent Ways wins (left-to-right starting from Reel 1)
export const evaluateWaysWins = (grid: ElementCell[][], betAmount: number): { wins: WaysWin[]; totalPayout: number } => {
  const wins: WaysWin[] = [];
  let totalPayout = 0;

  for (const sym of REGULAR_SYMBOLS) {
    const countsPerCol: number[] = [];
    const matchedCoords: { col: number; row: number }[] = [];

    // Check consecutive reels from col 0
    for (let c = 0; c < 6; c++) {
      let colMatches = 0;
      for (let r = 0; r < 5; r++) {
        const cell = grid[c][r];
        if (cell.type === sym || cell.type === 'wild') {
          colMatches++;
          matchedCoords.push({ col: c, row: r });
        }
      }
      if (colMatches > 0) {
        countsPerCol.push(colMatches);
      } else {
        break; // Ways must be strictly adjacent from leftmost column
      }
    }

    const matchCount = countsPerCol.length;
    if (matchCount >= 3) {
      // Calculate ways: product of matching counts in each consecutive reel
      let ways = 1;
      for (let i = 0; i < matchCount; i++) {
        ways *= countsPerCol[i];
      }

      // Only keep matched coordinates for the reels that matched
      const validCoords = matchedCoords.filter(pt => pt.col < matchCount);

      const config = ELEMENT_SYMBOLS[sym];
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
// 1. Winning cells that are Golden become WILD in their position.
// 2. Other winning cells are removed and new symbols drop from top.
export const cascadeGrid = (
  grid: ElementCell[][],
  winningCoords: { col: number; row: number }[],
  isFreeSpins: boolean = false
): ElementCell[][] => {
  const coordSet = new Set(winningCoords.map(c => `${c.col},${c.row}`));
  const nextGrid: ElementCell[][] = [];

  for (let c = 0; c < 6; c++) {
    const remainingColCells: ElementCell[] = [];

    // Process from bottom row (4) up to top row (0)
    for (let r = 4; r >= 0; r--) {
      const cell = grid[c][r];
      const isWinner = coordSet.has(`${c},${r}`);

      if (isWinner) {
        if (cell.isGolden) {
          // Signature Super Elements 2 mechanic: Golden symbols convert into WILD!
          remainingColCells.unshift({
            id: generateUniqueId(),
            type: 'wild',
            isGolden: false,
            isWildFromGolden: true,
            isNew: false
          });
        }
        // Non-golden winning cells disappear (do not keep)
      } else {
        // Non-winning cells survive and drop down
        remainingColCells.unshift({
          ...cell,
          isEliminating: false,
          isNew: false
        });
      }
    }

    // Now fill remaining empty rows from top with new symbols
    while (remainingColCells.length < 5) {
      let type: ElementSymbolType;
      const rand = Math.random();
      if (rand < 0.05 && c >= 1 && c <= 4) {
        type = 'wild';
      } else {
        type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
      }

      const canBeGolden = c >= 1 && c <= 4 && type !== 'wild';
      const isGolden = canBeGolden && Math.random() < (isFreeSpins ? 0.25 : 0.15);

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

// Count Scatters on the 6x5 grid
export const countScatters = (grid: ElementCell[][]): number => {
  let count = 0;
  for (let c = 0; c < 6; c++) {
    for (let r = 0; r < 5; r++) {
      if (grid[c][r].type === 'scatter') {
        count++;
      }
    }
  }
  return count;
};
