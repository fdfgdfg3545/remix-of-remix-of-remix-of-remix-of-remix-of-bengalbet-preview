// @ts-nocheck
import { 
  BoxingSymbolId, 
  BOXING_SYMBOLS, 
  BoxingCell, 
  MatchWin, 
  BASE_MULTIPLIER_LADDER, 
  FREE_SPINS_MULTIPLIER_LADDER 
} from './boxingKingTypes';

// Symbol weights for 5x5 grid
const BASE_SYMBOL_WEIGHTS: { symbol: BoxingSymbolId; weight: number }[] = [
  { symbol: 'RED_BOXER', weight: 8 },
  { symbol: 'BLUE_BOXER', weight: 10 },
  { symbol: 'RED_GLOVES', weight: 12 },
  { symbol: 'BLUE_GLOVES', weight: 14 },
  { symbol: 'RED_SHORTS', weight: 16 },
  { symbol: 'BLUE_BOOTS', weight: 18 },
  { symbol: 'ACE', weight: 22 },
  { symbol: 'KING', weight: 24 },
  { symbol: 'QUEEN', weight: 26 },
  { symbol: 'JACK', weight: 28 },
  { symbol: 'WILD', weight: 7 },
  { symbol: 'SCATTER', weight: 4 }
];

const TOTAL_WEIGHT = BASE_SYMBOL_WEIGHTS.reduce((acc, s) => acc + s.weight, 0);

export function getRandomBoxingSymbol(col?: number, isFreeSpins?: boolean): BoxingSymbolId {
  // Low-value symbols removed or reduced in Free Spins
  const weights = isFreeSpins 
    ? BASE_SYMBOL_WEIGHTS.filter(s => s.symbol !== 'JACK' && s.symbol !== 'QUEEN')
    : BASE_SYMBOL_WEIGHTS;

  const currentTotal = weights.reduce((acc, s) => acc + s.weight, 0);
  let rand = Math.random() * currentTotal;

  for (const item of weights) {
    if (rand < item.weight) {
      // In base game, Wilds appear primarily on middle reels (1, 2, 3)
      if (item.symbol === 'WILD' && !isFreeSpins && (col === 0 || col === 4)) {
        return Math.random() > 0.5 ? 'RED_GLOVES' : 'BLUE_GLOVES';
      }
      return item.symbol;
    }
    rand -= item.weight;
  }
  return 'JACK';
}

export function createInitialGrid(): BoxingCell[][] {
  const grid: BoxingCell[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: BoxingCell[] = [];
    for (let c = 0; c < 5; c++) {
      row.push({
        id: `box-${r}-${c}-${Math.random()}`,
        symbol: getRandomBoxingSymbol(c, false)
      });
    }
    grid.push(row);
  }
  return grid;
}

// Generate new fresh grid for a spin
export function generateSpinGrid(
  isFreeSpins: boolean = false,
  isTitleMatch: boolean = false
): BoxingCell[][] {
  const grid: BoxingCell[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: BoxingCell[] = [];
    for (let c = 0; c < 5; c++) {
      row.push({
        id: `box-${r}-${c}-${Date.now()}-${Math.random()}`,
        symbol: getRandomBoxingSymbol(c, isFreeSpins),
        isEliminated: false,
        isWinning: false
      });
    }
    grid.push(row);
  }

  // ExMATCH modifier in Title Match:
  // If row has red boxer in col 0 and blue boxer in col 4, transform row to Wilds!
  if (isTitleMatch) {
    for (let r = 0; r < 5; r++) {
      const matchTrigger = 
        (grid[r][0].symbol === 'RED_BOXER' && grid[r][4].symbol === 'BLUE_BOXER') ||
        (grid[r][0].symbol === 'BLUE_BOXER' && grid[r][4].symbol === 'RED_BOXER');

      if (matchTrigger) {
        for (let c = 1; c < 4; c++) {
          if (grid[r][c].symbol !== 'SCATTER') {
            grid[r][c].symbol = 'WILD';
            grid[r][c].isExMatch = true;
          }
        }
      }
    }
  }

  return grid;
}

// Evaluate wins across 5 columns (ways/paylines system)
export function evaluateGridWins(
  grid: BoxingCell[][],
  betAmount: number,
  comboStep: number,
  isFreeSpins: boolean
): { wins: MatchWin[]; winningCells: Set<string>; totalRoundWin: number } {
  const ladder = isFreeSpins ? FREE_SPINS_MULTIPLIER_LADDER : BASE_MULTIPLIER_LADDER;
  const comboMultiplier = ladder[Math.min(comboStep, ladder.length - 1)];

  const wins: MatchWin[] = [];
  const winningCells = new Set<string>();

  // Check payline patterns (Horizontal rows, diagonals, V-shapes, W-shapes)
  // Standard 5-row checks
  for (let r = 0; r < 5; r++) {
    const symbolsInRow = [
      grid[r][0],
      grid[r][1],
      grid[r][2],
      grid[r][3],
      grid[r][4]
    ];

    // Find non-wild candidate from reel 0 or 1
    const firstNonWild = symbolsInRow.find(c => c.symbol !== 'WILD' && c.symbol !== 'SCATTER');
    if (!firstNonWild) continue;

    const targetSymbol = firstNonWild.symbol;
    let matchCount = 0;
    const coords: [number, number][] = [];

    for (let c = 0; c < 5; c++) {
      const cell = grid[r][c];
      if (cell.symbol === targetSymbol || cell.symbol === 'WILD') {
        matchCount++;
        coords.push([r, c]);
      } else {
        break; // Consecutive from left to right
      }
    }

    if (matchCount >= 3) {
      const config = BOXING_SYMBOLS[targetSymbol];
      const basePayout = matchCount === 5 ? config.payout5 : matchCount === 4 ? config.payout4 : config.payout3;
      const winAmount = (betAmount / 10) * basePayout * comboMultiplier;

      wins.push({
        symbol: targetSymbol,
        count: matchCount,
        multiplier: basePayout,
        comboMultiplier,
        totalWin: winAmount,
        winningCoords: coords
      });

      coords.forEach(([row, col]) => {
        grid[row][col].isWinning = true;
        winningCells.add(`${row}-${col}`);
      });
    }
  }

  // Also check diagonal lines (Top-left to bottom-right and Bottom-left to top-right)
  const diagonals = [
    [[0,0], [1,1], [2,2], [3,3], [4,4]],
    [[4,0], [3,1], [2,2], [1,3], [0,4]],
    [[1,0], [2,1], [3,2], [2,3], [1,4]], // V-center
    [[3,0], [2,1], [1,2], [2,3], [3,4]]  // Inverted V
  ];

  for (const line of diagonals) {
    const cells = line.map(([r, c]) => grid[r][c]);
    const firstNonWild = cells.find(c => c.symbol !== 'WILD' && c.symbol !== 'SCATTER');
    if (!firstNonWild) continue;

    const targetSymbol = firstNonWild.symbol;
    let matchCount = 0;
    const coords: [number, number][] = [];

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.symbol === targetSymbol || cell.symbol === 'WILD') {
        matchCount++;
        coords.push(line[i] as [number, number]);
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      const config = BOXING_SYMBOLS[targetSymbol];
      const basePayout = matchCount === 5 ? config.payout5 : matchCount === 4 ? config.payout4 : config.payout3;
      const winAmount = (betAmount / 10) * basePayout * comboMultiplier;

      wins.push({
        symbol: targetSymbol,
        count: matchCount,
        multiplier: basePayout,
        comboMultiplier,
        totalWin: winAmount,
        winningCoords: coords
      });

      coords.forEach(([row, col]) => {
        grid[row][col].isWinning = true;
        winningCells.add(`${row}-${col}`);
      });
    }
  }

  const totalRoundWin = wins.reduce((acc, w) => acc + w.totalWin, 0);

  return {
    wins,
    winningCells,
    totalRoundWin
  };
}

// Perform symbol cascading drop
export function cascadeGrid(grid: BoxingCell[][], isFreeSpins: boolean = false): BoxingCell[][] {
  const newGrid: BoxingCell[][] = [];

  for (let c = 0; c < 5; c++) {
    // Collect non-eliminated cells in column c
    const surviving: BoxingCell[] = [];
    for (let r = 4; r >= 0; r--) {
      if (!grid[r][c].isWinning) {
        surviving.push(grid[r][c]);
      }
    }

    // Fill missing top cells with new symbols
    const missingCount = 5 - surviving.length;
    const newCells: BoxingCell[] = [];
    for (let i = 0; i < missingCount; i++) {
      newCells.push({
        id: `box-drop-${Date.now()}-${c}-${i}-${Math.random()}`,
        symbol: getRandomBoxingSymbol(c, isFreeSpins),
        isEliminated: false,
        isWinning: false
      });
    }

    // Column reconstructed from top (newCells) to bottom (surviving reversed)
    const fullCol = [...newCells, ...surviving.reverse()];

    for (let r = 0; r < 5; r++) {
      if (!newGrid[r]) newGrid[r] = [];
      newGrid[r][c] = fullCol[r];
    }
  }

  return newGrid;
}

// Count Scatters on the 5x5 grid
export function countScatters(grid: BoxingCell[][]): number {
  let count = 0;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (grid[r][c].symbol === 'SCATTER') {
        count++;
      }
    }
  }
  return count;
}
