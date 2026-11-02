// @ts-nocheck
import {
  MagicAceCard,
  MagicAceSymbolType,
  MagicAceWinLine,
  MagicAceCascadeResult
} from './magicAceTypes';

const REGULAR_SYMBOLS: MagicAceSymbolType[] = [
  'ace_spades',
  'king_hearts',
  'queen_clubs',
  'jack_diamonds',
  'ten',
  'nine'
];

const PAYOUT_TABLE: Record<MagicAceSymbolType, { 3: number; 4: number; 5: number; nameEn: string; nameBn: string }> = {
  ace_spades: { 3: 1.5, 4: 3.0, 5: 6.0, nameEn: 'Ace of Spades', nameBn: 'এস অফ স্পেডস' },
  king_hearts: { 3: 1.0, 4: 2.0, 5: 4.0, nameEn: 'King of Hearts', nameBn: 'কিং অফ হার্টস' },
  queen_clubs: { 3: 0.8, 4: 1.5, 5: 3.0, nameEn: 'Queen of Clubs', nameBn: 'কুইন অফ ক্লাবস' },
  jack_diamonds: { 3: 0.6, 4: 1.2, 5: 2.5, nameEn: 'Jack of Diamonds', nameBn: 'জ্যাক অফ ডায়মন্ডস' },
  ten: { 3: 0.4, 4: 0.8, 5: 1.5, nameEn: 'Card 10', nameBn: 'কার্ড ১০' },
  nine: { 3: 0.2, 4: 0.5, 5: 1.0, nameEn: 'Card 9', nameBn: 'কার্ড ৯' },
  wild: { 3: 2.0, 4: 4.0, 5: 10.0, nameEn: 'Magic Ace Wild', nameBn: 'ম্যাজিক এস ওয়াইল্ড' },
  wild_lock: { 3: 3.0, 4: 6.0, 5: 15.0, nameEn: 'Wild Lock', nameBn: 'ওয়াইল্ড লক' },
  scatter: { 3: 2.0, 4: 5.0, 5: 20.0, nameEn: 'Magic Scatter', nameBn: 'ম্যাজিক স্ক্যাটার' }
};

export const BASE_MULTIPLIERS = [1, 2, 3, 5];
export const FREE_SPIN_MULTIPLIERS = [2, 4, 6, 10];

let cardCounter = 0;

export function generateCard(
  reelIdx: number,
  isFreeSpins: boolean = false,
  forceWildLock: boolean = false
): MagicAceCard {
  cardCounter++;
  const id = `card-${Date.now()}-${cardCounter}-${Math.random().toString(36).substr(2, 5)}`;

  if (forceWildLock) {
    return {
      id,
      type: 'wild_lock',
      isLocked: true,
      lockCount: 2
    };
  }

  const rand = Math.random();

  // Scatter chance (reels 1, 3, 5 primarily)
  if ((reelIdx === 0 || reelIdx === 2 || reelIdx === 4) && rand < 0.05) {
    return { id, type: 'scatter' };
  }

  // Wild Lock chance (higher in Free Spins)
  const wildLockChance = isFreeSpins ? 0.08 : 0.04;
  if (rand < wildLockChance && reelIdx >= 1 && reelIdx <= 3) {
    return {
      id,
      type: 'wild_lock',
      isLocked: true,
      lockCount: 2
    };
  }

  // Regular Wild chance
  const wildChance = isFreeSpins ? 0.12 : 0.06;
  if (rand < wildLockChance + wildChance && reelIdx >= 1) {
    return { id, type: 'wild' };
  }

  // Regular symbol
  const sym = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];

  // Golden card chance on reels 2, 3, 4
  const isGolden = (reelIdx === 1 || reelIdx === 2 || reelIdx === 3) && Math.random() < 0.22;

  return {
    id,
    type: sym,
    isGolden
  };
}

export function generateInitialGrid(isFreeSpins: boolean = false): MagicAceCard[][] {
  const grid: MagicAceCard[][] = [];
  for (let r = 0; r < 5; r++) {
    const reel: MagicAceCard[] = [];
    for (let row = 0; row < 4; row++) {
      reel.push(generateCard(r, isFreeSpins));
    }
    grid.push(reel);
  }
  return grid;
}

export function evaluateMagicAceCascades(
  currentGrid: MagicAceCard[][],
  stepIndex: number,
  bet: number,
  isFreeSpins: boolean = false
): MagicAceCascadeResult {
  const multList = isFreeSpins ? FREE_SPIN_MULTIPLIERS : BASE_MULTIPLIERS;
  const currentMult = multList[Math.min(stepIndex, multList.length - 1)];

  // Clone grid
  const grid = currentGrid.map(reel => reel.map(c => ({ ...c, isWinning: false })));

  // Count Scatters
  let scatterCount = 0;
  for (let r = 0; r < 5; r++) {
    for (let row = 0; row < 4; row++) {
      if (grid[r][row].type === 'scatter') {
        scatterCount++;
      }
    }
  }

  const wins: MagicAceWinLine[] = [];
  let totalWin = 0;

  // Evaluate 1024 ways for each regular symbol
  for (const sym of REGULAR_SYMBOLS) {
    let consecutiveReels = 0;
    const countPerReel: number[] = [0, 0, 0, 0, 0];

    for (let r = 0; r < 5; r++) {
      let count = 0;
      for (let row = 0; row < 4; row++) {
        const card = grid[r][row];
        if (card.type === sym || card.type === 'wild' || card.type === 'wild_lock') {
          count++;
        }
      }
      countPerReel[r] = count;
      if (count > 0) {
        if (consecutiveReels === r) {
          consecutiveReels++;
        }
      }
    }

    if (consecutiveReels >= 3) {
      // Calculate ways
      let ways = 1;
      for (let r = 0; r < consecutiveReels; r++) {
        ways *= countPerReel[r];
      }

      const payoutDef = PAYOUT_TABLE[sym];
      const matchKey = consecutiveReels as 3 | 4 | 5;
      const baseMult = payoutDef[matchKey] || 0.5;

      const payout = ways * baseMult * (bet / 10) * currentMult;
      totalWin += payout;

      wins.push({
        symbol: sym,
        count: consecutiveReels,
        ways,
        payout,
        nameEn: payoutDef.nameEn,
        nameBn: payoutDef.nameBn
      });

      // Mark winning cards
      for (let r = 0; r < consecutiveReels; r++) {
        for (let row = 0; row < 4; row++) {
          const card = grid[r][row];
          if (card.type === sym || card.type === 'wild' || card.type === 'wild_lock') {
            card.isWinning = true;
          }
        }
      }
    }
  }

  // Free spins awarded for 3+ scatters
  let freeSpinsAwarded = 0;
  if (scatterCount >= 3) {
    freeSpinsAwarded = 10 + (scatterCount - 3) * 2;
  }

  return {
    grid,
    wins,
    stepMultiplier: currentMult,
    stepWin: totalWin,
    scatterCount,
    freeSpinsAwarded,
    newWildLocks: 0
  };
}

// Process elimination and drops
export function applyEliminationAndDrops(
  currentGrid: MagicAceCard[][],
  isFreeSpins: boolean = false
): { nextGrid: MagicAceCard[][]; newWildLocks: number } {
  let newWildLocks = 0;
  const nextGrid: MagicAceCard[][] = [];

  for (let r = 0; r < 5; r++) {
    const survivingReel: MagicAceCard[] = [];

    for (let row = 0; row < 4; row++) {
      const card = currentGrid[r][row];

      // If card was winning
      if (card.isWinning) {
        // If it was a Wild Lock with remaining locks
        if (card.isLocked && card.lockCount && card.lockCount > 1) {
          survivingReel.push({
            ...card,
            lockCount: card.lockCount - 1,
            isWinning: false
          });
        }
        // If it was a Golden card, it transforms to Wild or Wild Lock!
        else if (card.isGolden) {
          const makeLock = Math.random() < (isFreeSpins ? 0.5 : 0.35);
          if (makeLock) {
            newWildLocks++;
            survivingReel.push({
              id: `wildlock-${Date.now()}-${Math.random()}`,
              type: 'wild_lock',
              isLocked: true,
              lockCount: 2,
              isWinning: false
            });
          } else {
            survivingReel.push({
              id: `wild-${Date.now()}-${Math.random()}`,
              type: 'wild',
              isWinning: false
            });
          }
        }
        // Normal card is eliminated
      } else {
        survivingReel.push({ ...card, isWinning: false });
      }
    }

    // Drop new cards on top to refill to 4 rows
    while (survivingReel.length < 4) {
      survivingReel.unshift(generateCard(r, isFreeSpins));
    }

    nextGrid.push(survivingReel);
  }

  return { nextGrid, newWildLocks };
}
