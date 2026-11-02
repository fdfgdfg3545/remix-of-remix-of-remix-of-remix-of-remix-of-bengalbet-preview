// @ts-nocheck
import { 
  FortuneTreeCell, 
  FortuneTreeSymbolType, 
  FortuneTreePaylineWin, 
  FORTUNE_TREE_COLS, 
  FORTUNE_TREE_ROWS, 
  FORTUNE_TREE_PAYLINES, 
  FORTUNE_TREE_SYMBOLS 
} from './fortuneTreeTypes';

const SYMBOL_WEIGHTS: { type: FortuneTreeSymbolType; weight: number }[] = [
  { type: 'jack', weight: 26 },
  { type: 'queen', weight: 24 },
  { type: 'king', weight: 22 },
  { type: 'ace', weight: 20 },
  { type: 'red_lantern', weight: 16 },
  { type: 'jade_carp', weight: 13 },
  { type: 'sycee', weight: 10 },
  { type: 'jin_chan', weight: 7 },
  { type: 'golden_tree', weight: 6 }, // Wild
  { type: 'scatter', weight: 4 },     // Fortune Pot
  { type: 'red_packet', weight: 5 }   // Hongbao
];

export function getRandomFortuneSymbol(isBonusBoost: boolean = false): FortuneTreeSymbolType {
  const pool = SYMBOL_WEIGHTS.map(item => {
    if (isBonusBoost && (item.type === 'scatter' || item.type === 'golden_tree' || item.type === 'red_packet')) {
      return { ...item, weight: item.weight * 2.2 };
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

export function createInitialFortuneTreeGrid(): FortuneTreeCell[][] {
  const grid: FortuneTreeCell[][] = [];
  for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
    const col: FortuneTreeCell[] = [];
    for (let r = 0; r < FORTUNE_TREE_ROWS; r++) {
      col.push({
        id: `c${c}-r${r}-${Date.now()}-${Math.random()}`,
        type: getRandomFortuneSymbol(false)
      });
    }
    grid.push(col);
  }
  return grid;
}

export function generateFortuneTreeGrid(forceBonus: boolean = false): FortuneTreeCell[][] {
  const grid: FortuneTreeCell[][] = [];
  for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
    const col: FortuneTreeCell[] = [];
    for (let r = 0; r < FORTUNE_TREE_ROWS; r++) {
      col.push({
        id: `c${c}-r${r}-${Date.now()}-${Math.random()}`,
        type: getRandomFortuneSymbol(forceBonus)
      });
    }
    grid.push(col);
  }

  if (forceBonus) {
    // Put at least 3 scatters or 3 red packets
    const targetCols = [0, 2, 4];
    targetCols.forEach(colIdx => {
      const rowIdx = Math.floor(Math.random() * FORTUNE_TREE_ROWS);
      grid[colIdx][rowIdx].type = 'scatter';
    });
  }

  return grid;
}

// Check if Tree Shake Feature triggers
export function shouldTriggerTreeShake(isFreeSpins: boolean): boolean {
  // 22% in normal spin, 50% in Free Spins
  const chance = isFreeSpins ? 0.50 : 0.22;
  return Math.random() < chance;
}

// Apply Golden Tree Wild drop on random cells
export function applyTreeShakeWilds(grid: FortuneTreeCell[][]): {
  newGrid: FortuneTreeCell[][];
  wildCount: number;
} {
  const newGrid = grid.map(col => col.map(cell => ({ ...cell })));
  // Drops 2 to 4 wilds
  const dropCount = Math.floor(Math.random() * 3) + 2;
  let placed = 0;

  for (let i = 0; i < dropCount; i++) {
    const c = Math.floor(Math.random() * FORTUNE_TREE_COLS);
    const r = Math.floor(Math.random() * FORTUNE_TREE_ROWS);
    if (newGrid[c][r].type !== 'scatter' && newGrid[c][r].type !== 'red_packet') {
      newGrid[c][r].type = 'golden_tree';
      newGrid[c][r].isWild = true;
      // Chance of multiplier x2 or x3
      const multRoll = Math.random();
      if (multRoll < 0.35) {
        newGrid[c][r].multiplier = 2;
      } else if (multRoll < 0.55) {
        newGrid[c][r].multiplier = 3;
      }
      placed++;
    }
  }

  return { newGrid, wildCount: placed };
}

// 30 Fixed Paylines Evaluation
export function evaluateFortuneTreeWins(
  grid: FortuneTreeCell[][],
  betAmount: number
): { wins: FortuneTreePaylineWin[]; totalPayout: number } {
  const lineBet = betAmount / 30;
  const wins: FortuneTreePaylineWin[] = [];
  let totalPayout = 0;

  FORTUNE_TREE_PAYLINES.forEach((linePattern, lineIndex) => {
    // Gather 5 cells along this payline
    const lineCells: FortuneTreeCell[] = [];
    for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
      const row = linePattern[c];
      lineCells.push(grid[c][row]);
    }

    // Determine target symbol (first non-wild symbol from left)
    let targetSym: FortuneTreeSymbolType | null = null;
    for (const cell of lineCells) {
      if (cell.type !== 'golden_tree' && cell.type !== 'scatter' && cell.type !== 'red_packet') {
        targetSym = cell.type;
        break;
      }
    }

    // If all were wilds, top symbol applies
    if (!targetSym) {
      targetSym = 'golden_tree';
    }

    // Count matches from reel 0
    let matchCount = 0;
    let lineMultiplier = 1;
    const coords: { col: number; row: number }[] = [];

    for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
      const cell = lineCells[c];
      const isMatch = cell.type === targetSym || cell.type === 'golden_tree';

      if (isMatch) {
        matchCount++;
        coords.push({ col: c, row: linePattern[c] });
        if (cell.multiplier && cell.multiplier > 1) {
          lineMultiplier *= cell.multiplier;
        }
      } else {
        break; // Sequence broken
      }
    }

    if (matchCount >= 3) {
      const basePay = (FORTUNE_TREE_SYMBOLS[targetSym].basePayouts as Record<number, number>)[matchCount] || 0;
      if (basePay > 0) {
        const payout = lineBet * basePay * lineMultiplier;
        totalPayout += payout;
        wins.push({
          lineIndex,
          symbolType: targetSym,
          matchCount,
          payout,
          multiplier: lineMultiplier,
          coordinates: coords
        });
      }
    }
  });

  return { wins, totalPayout };
}

// Count Scatters (Fortune Pot)
export function countFortuneTreeScatters(grid: FortuneTreeCell[][]): number {
  let count = 0;
  for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
    for (let r = 0; r < FORTUNE_TREE_ROWS; r++) {
      if (grid[c][r].type === 'scatter') {
        count++;
      }
    }
  }
  return count;
}

// Count Red Packets (Hongbao)
export function countFortuneTreeHongbao(grid: FortuneTreeCell[][]): number {
  let count = 0;
  for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
    for (let r = 0; r < FORTUNE_TREE_ROWS; r++) {
      if (grid[c][r].type === 'red_packet') {
        count++;
      }
    }
  }
  return count;
}
