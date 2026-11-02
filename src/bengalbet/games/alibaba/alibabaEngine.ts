// @ts-nocheck
import { 
  AlibabaCell, 
  AlibabaSymbolType, 
  AlibabaWinWay, 
  ALIBABA_COLS, 
  ALIBABA_ROWS, 
  ALIBABA_SYMBOLS 
} from './alibabaTypes';

// Symbol weights for authentic PG Soft slot distribution
const BASE_SYMBOL_WEIGHTS: { type: AlibabaSymbolType; weight: number }[] = [
  { type: 'ten', weight: 26 },
  { type: 'jack', weight: 24 },
  { type: 'queen', weight: 22 },
  { type: 'king', weight: 20 },
  { type: 'ace', weight: 18 },
  { type: 'scimitar', weight: 14 },
  { type: 'magic_carpet', weight: 12 },
  { type: 'treasure_chest', weight: 10 },
  { type: 'morgiana', weight: 8 },
  { type: 'alibaba', weight: 6 },
  { type: 'wild', weight: 7 },
  { type: 'scatter', weight: 4 },
  { type: 'cave_bonus', weight: 4 }
];

export function getRandomAlibabaSymbol(isBonusBoost: boolean = false): AlibabaSymbolType {
  const pool = BASE_SYMBOL_WEIGHTS.map(item => {
    if (isBonusBoost && (item.type === 'scatter' || item.type === 'wild' || item.type === 'cave_bonus')) {
      return { ...item, weight: item.weight * 2.5 };
    }
    return item;
  });

  const total = pool.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of pool) {
    if (rand < item.weight) {
      return item.type;
    }
    rand -= item.weight;
  }
  return 'ace';
}

export function createInitialAlibabaGrid(): AlibabaCell[][] {
  const grid: AlibabaCell[][] = [];
  for (let c = 0; c < ALIBABA_COLS; c++) {
    const col: AlibabaCell[] = [];
    for (let r = 0; r < ALIBABA_ROWS; r++) {
      col.push({
        id: `c${c}-r${r}-${Date.now()}-${Math.random()}`,
        type: getRandomAlibabaSymbol(false)
      });
    }
    grid.push(col);
  }
  return grid;
}

export function generateAlibabaSpinGrid(forceBonus: boolean = false): AlibabaCell[][] {
  const grid: AlibabaCell[][] = [];
  for (let c = 0; c < ALIBABA_COLS; c++) {
    const col: AlibabaCell[] = [];
    for (let r = 0; r < ALIBABA_ROWS; r++) {
      let type = getRandomAlibabaSymbol(forceBonus);
      col.push({
        id: `c${c}-r${r}-${Date.now()}-${Math.random()}`,
        type
      });
    }
    grid.push(col);
  }

  if (forceBonus) {
    // Ensure at least 3 scatters are placed
    const cols = [0, 1, 2, 3, 4].sort(() => 0.5 - Math.random()).slice(0, 3);
    cols.forEach(colIdx => {
      const rowIdx = Math.floor(Math.random() * ALIBABA_ROWS);
      grid[colIdx][rowIdx].type = 'scatter';
    });
  }

  return grid;
}

// 1024 Ways Evaluation (Left to Right from Reel 0)
export function evaluateAlibabaWaysWins(
  grid: AlibabaCell[][],
  betAmount: number
): { wins: AlibabaWinWay[]; totalPayout: number } {
  const winningSymbols: AlibabaSymbolType[] = [
    'alibaba',
    'morgiana',
    'treasure_chest',
    'magic_carpet',
    'scimitar',
    'ace',
    'king',
    'queen',
    'jack',
    'ten'
  ];

  const wins: AlibabaWinWay[] = [];
  let totalPayout = 0;

  for (const sym of winningSymbols) {
    let matchCount = 0;
    let ways = 1;
    const matchingCoords: { col: number; row: number }[] = [];

    for (let c = 0; c < ALIBABA_COLS; c++) {
      let countInCol = 0;
      for (let r = 0; r < ALIBABA_ROWS; r++) {
        const cell = grid[c][r];
        if (cell.type === sym || cell.type === 'wild') {
          countInCol++;
          matchingCoords.push({ col: c, row: r });
        }
      }

      if (countInCol > 0) {
        matchCount++;
        ways *= countInCol;
      } else {
        break; // Match broken
      }
    }

    if (matchCount >= 3) {
      const payouts = ALIBABA_SYMBOLS[sym].basePayouts;
      const baseMultiplier = (payouts as Record<number, number>)[matchCount] || 0;
      if (baseMultiplier > 0) {
        // Base win for this way
        const payout = (betAmount / 20) * baseMultiplier * ways;
        totalPayout += payout;
        wins.push({
          symbolType: sym,
          matchCount,
          ways,
          payoutPerWay: baseMultiplier,
          totalWin: payout,
          coordinates: matchingCoords.filter(coord => coord.col < matchCount)
        });
      }
    }
  }

  return { wins, totalPayout };
}

// Cascading Elimination and Refill
export function cascadeAlibabaGrid(
  grid: AlibabaCell[][],
  winningCoords: { col: number; row: number }[]
): { nextGrid: AlibabaCell[][]; eliminatedCount: number } {
  // Deep clone
  const nextGrid: AlibabaCell[][] = grid.map(col => col.map(cell => ({ ...cell })));
  const markedMap: Record<string, boolean> = {};

  winningCoords.forEach(c => {
    markedMap[`${c.col}-${c.row}`] = true;
  });

  let eliminatedCount = 0;

  for (let c = 0; c < ALIBABA_COLS; c++) {
    const survivingCells: AlibabaCell[] = [];
    for (let r = 0; r < ALIBABA_ROWS; r++) {
      if (!markedMap[`${c}-${r}`]) {
        survivingCells.push(nextGrid[c][r]);
      } else {
        eliminatedCount++;
      }
    }

    // Number of new cells needed at the top
    const missingCount = ALIBABA_ROWS - survivingCells.length;
    const newCells: AlibabaCell[] = [];
    for (let i = 0; i < missingCount; i++) {
      newCells.push({
        id: `new-c${c}-r${i}-${Date.now()}-${Math.random()}`,
        type: getRandomAlibabaSymbol(false),
        isNew: true
      });
    }

    nextGrid[c] = [...newCells, ...survivingCells];
  }

  return { nextGrid, eliminatedCount };
}

// Count Scatters on Grid
export function countAlibabaScatters(grid: AlibabaCell[][]): number {
  let count = 0;
  for (let c = 0; c < ALIBABA_COLS; c++) {
    for (let r = 0; r < ALIBABA_ROWS; r++) {
      if (grid[c][r].type === 'scatter') {
        count++;
      }
    }
  }
  return count;
}

// Count Cave Mystery Bonus Urns
export function countAlibabaBonusUrns(grid: AlibabaCell[][]): number {
  let count = 0;
  for (let c = 0; c < ALIBABA_COLS; c++) {
    for (let r = 0; r < ALIBABA_ROWS; r++) {
      if (grid[c][r].type === 'cave_bonus') {
        count++;
      }
    }
  }
  return count;
}
