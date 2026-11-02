// @ts-nocheck
import {
  SevenCoinsSymbolType,
  SevenCoinsCell,
  SevenCoinsPaylineWin,
  SEVEN_COINS_PAYLINES,
  SEVEN_COINS_PAYOUTS,
  JackpotTier
} from './sevenCoinsTypes';

const REGULAR_WEIGHTS: { type: SevenCoinsSymbolType; weight: number }[] = [
  { type: 'cherry', weight: 25 },
  { type: 'orange', weight: 20 },
  { type: 'plum', weight: 16 },
  { type: 'grapes', weight: 13 },
  { type: 'watermelon', weight: 10 },
  { type: 'bar', weight: 8 },
  { type: 'bell', weight: 5 },
  { type: 'seven', weight: 3 },
  { type: 'bonus_coin', weight: 11 }
];

const COIN_VALUES = [1, 2, 3, 5, 8, 10, 15];

export function getRandomCoinValue(): { value: number; tier?: JackpotTier } {
  const rand = Math.random();
  if (rand < 0.02) {
    return { value: 150, tier: 'major' };
  } else if (rand < 0.06) {
    return { value: 50, tier: 'minor' };
  } else if (rand < 0.12) {
    return { value: 25, tier: 'mini' };
  } else {
    const val = COIN_VALUES[Math.floor(Math.random() * COIN_VALUES.length)];
    return { value: val };
  }
}

export function getRandomRegularSymbol(colIdx: number): SevenCoinsSymbolType {
  // On reel 2 (center col), Collect Coin has a special chance to appear
  if (colIdx === 1 && Math.random() < 0.12) {
    return 'collect_coin';
  }

  const total = REGULAR_WEIGHTS.reduce((acc, curr) => acc + curr.weight, 0);
  let rand = Math.random() * total;
  for (const item of REGULAR_WEIGHTS) {
    if (rand < item.weight) return item.type;
    rand -= item.weight;
  }
  return 'cherry';
}

export function generateSevenCoinsGrid(forceBonus: boolean = false): SevenCoinsCell[][] {
  const grid: SevenCoinsCell[][] = [];

  for (let c = 0; c < 3; c++) {
    const col: SevenCoinsCell[] = [];
    for (let r = 0; r < 3; r++) {
      const type = getRandomRegularSymbol(c);
      let coinValue: number | undefined;
      let jackpotTier: JackpotTier | undefined;

      if (type === 'bonus_coin') {
        const coinData = getRandomCoinValue();
        coinValue = coinData.value;
        jackpotTier = coinData.tier;
      }

      col.push({
        id: `c${c}-r${r}-${Date.now()}-${Math.random()}`,
        type,
        coinValue,
        jackpotTier
      });
    }
    grid.push(col);
  }

  if (forceBonus) {
    // Drop 3 guaranteed coins across the reels to trigger Hold & Win
    grid[0][1] = {
      id: `bonus-0-${Date.now()}`,
      type: 'bonus_coin',
      coinValue: 5
    };
    grid[1][1] = {
      id: `bonus-1-${Date.now()}`,
      type: 'collect_coin'
    };
    grid[2][1] = {
      id: `bonus-2-${Date.now()}`,
      type: 'bonus_coin',
      coinValue: 25,
      jackpotTier: 'mini'
    };
  }

  return grid;
}

// Evaluate line wins across 5 paylines
export function evaluatePaylines(grid: SevenCoinsCell[][], betAmount: number): SevenCoinsPaylineWin[] {
  const wins: SevenCoinsPaylineWin[] = [];
  const lineBet = betAmount / 5;

  SEVEN_COINS_PAYLINES.forEach((line, lineIndex) => {
    const sym0 = grid[0][line[0]].type;
    const sym1 = grid[1][line[1]].type;
    const sym2 = grid[2][line[2]].type;

    // Coins don't pay on regular paylines (they pay via Collect or Hold & Win)
    if (sym0 === 'bonus_coin' || sym0 === 'collect_coin') return;

    if (sym0 === sym1 && sym1 === sym2) {
      const multiplier = SEVEN_COINS_PAYOUTS[sym0] || 0;
      if (multiplier > 0) {
        wins.push({
          lineIndex,
          symbolType: sym0,
          payout: lineBet * multiplier,
          coordinates: [
            { col: 0, row: line[0] },
            { col: 1, row: line[1] },
            { col: 2, row: line[2] }
          ]
        });
      }
    }
  });

  return wins;
}

// Evaluate Collect feature in base game (Reel 2 Collect coin gathers coins on reel 1 & 3)
export function evaluateCollectFeature(grid: SevenCoinsCell[][], betAmount: number): {
  hasCollect: boolean;
  collectPosition: { col: number; row: number } | null;
  collectedCoins: { col: number; row: number; value: number; tier?: JackpotTier }[];
  totalCollectedCash: number;
} {
  let collectPosition: { col: number; row: number } | null = null;

  for (let r = 0; r < 3; r++) {
    if (grid[1][r].type === 'collect_coin') {
      collectPosition = { col: 1, row: r };
      break;
    }
  }

  if (!collectPosition) {
    return { hasCollect: false, collectPosition: null, collectedCoins: [], totalCollectedCash: 0 };
  }

  const collectedCoins: { col: number; row: number; value: number; tier?: JackpotTier }[] = [];
  let totalMultiplier = 0;

  for (let c of [0, 2]) {
    for (let r = 0; r < 3; r++) {
      if (grid[c][r].type === 'bonus_coin' && grid[c][r].coinValue) {
        collectedCoins.push({
          col: c,
          row: r,
          value: grid[c][r].coinValue!,
          tier: grid[c][r].jackpotTier
        });
        totalMultiplier += grid[c][r].coinValue!;
      }
    }
  }

  return {
    hasCollect: collectedCoins.length > 0,
    collectPosition,
    collectedCoins,
    totalCollectedCash: totalMultiplier * betAmount
  };
}

// Check if 3 or more coin symbols landed to trigger Hold & Win
export function checkHoldAndWinTrigger(grid: SevenCoinsCell[][]): boolean {
  let count = 0;
  for (let c = 0; c < 3; c++) {
    for (let r = 0; r < 3; r++) {
      if (grid[c][r].type === 'bonus_coin' || grid[c][r].type === 'collect_coin') {
        count++;
      }
    }
  }
  return count >= 3;
}
