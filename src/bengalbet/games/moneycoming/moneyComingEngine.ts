// @ts-nocheck
import {
  MoneyComingCell,
  MoneyComingNumber,
  MoneyComingSpecial,
  MoneyComingSpecialCell,
  MoneyComingSpinResult
} from './moneyComingTypes';

// Strip weights for authentic JILI Money Coming probabilities
const REEL_1_STRIP: MoneyComingNumber[] = [
  'blank', 'blank', '1', 'blank', '2', 'blank', '5', 'blank', '1', '10', 'blank', '2', 'blank'
];

const REEL_2_STRIP: MoneyComingNumber[] = [
  'blank', '0', 'blank', '00', 'blank', '5', 'blank', '0', 'blank', '10', 'blank', '0'
];

const REEL_3_STRIP: MoneyComingNumber[] = [
  'blank', '0', 'blank', '00', 'blank', '10', 'blank', '100', 'blank', '0', 'blank'
];

const SPECIAL_REEL_STRIP: MoneyComingSpecial[] = [
  'blank', 'mult_2x', 'blank', 'mult_5x', 'blank', 'respin', 'blank', 'mult_10x', 'blank', 'wheel_bonus', 'blank'
];

function getRandomSymbol<T>(strip: T[]): T {
  return strip[Math.floor(Math.random() * strip.length)];
}

export function generateInitialReels(): {
  reels: [MoneyComingCell[], MoneyComingCell[], MoneyComingCell[]];
  specialReel: MoneyComingSpecialCell[];
} {
  const r1: MoneyComingCell[] = [
    { id: 'r1-top', value: '1' },
    { id: 'r1-mid', value: '10' },
    { id: 'r1-bot', value: 'blank' }
  ];
  const r2: MoneyComingCell[] = [
    { id: 'r2-top', value: '0' },
    { id: 'r2-mid', value: '0' },
    { id: 'r2-bot', value: '5' }
  ];
  const r3: MoneyComingCell[] = [
    { id: 'r3-top', value: 'blank' },
    { id: 'r3-mid', value: '0' },
    { id: 'r3-bot', value: '00' }
  ];
  const sp: MoneyComingSpecialCell[] = [
    { id: 'sp-top', value: 'blank' },
    { id: 'sp-mid', value: 'mult_2x' },
    { id: 'sp-bot', value: 'blank' }
  ];

  return {
    reels: [r1, r2, r3],
    specialReel: sp
  };
}

export function evaluateMoneyComingSpin(
  bet: number,
  isGuaranteedWin: boolean = false
): MoneyComingSpinResult {
  // Generate random reel stops
  let r1Val = getRandomSymbol(REEL_1_STRIP);
  let r2Val = getRandomSymbol(REEL_2_STRIP);
  let r3Val = getRandomSymbol(REEL_3_STRIP);
  let spVal = getRandomSymbol(SPECIAL_REEL_STRIP);

  // If guaranteed win (e.g. from Respin)
  if (isGuaranteedWin) {
    r1Val = ['1', '2', '5', '10'][Math.floor(Math.random() * 4)] as MoneyComingNumber;
    r2Val = ['0', '00', '5'][Math.floor(Math.random() * 3)] as MoneyComingNumber;
    r3Val = ['0', '00', 'blank'][Math.floor(Math.random() * 3)] as MoneyComingNumber;
    spVal = ['mult_2x', 'mult_5x', 'respin', 'wheel_bonus'][Math.floor(Math.random() * 4)] as MoneyComingSpecial;
  }

  // Parse formed number along payline (middle row)
  let numString = '';
  if (r1Val !== 'blank') numString += r1Val;
  if (r2Val !== 'blank') numString += r2Val;
  if (r3Val !== 'blank') numString += r3Val;

  const formedNumber = numString === '' ? 0 : parseInt(numString, 10);

  // Evaluate special reel
  let multiplier = 1;
  let hasRespin = false;
  let hasWheelBonus = false;

  if (spVal === 'mult_2x') multiplier = 2;
  else if (spVal === 'mult_5x') multiplier = 5;
  else if (spVal === 'mult_10x') multiplier = 10;
  else if (spVal === 'respin') hasRespin = true;
  else if (spVal === 'wheel_bonus') hasWheelBonus = true;

  // Base coin bet scale (bet / 10)
  const coinUnit = Math.max(1, bet / 10);
  const baseWin = formedNumber * coinUnit;
  const totalWin = baseWin * multiplier;

  const isWin = totalWin > 0 || hasWheelBonus || hasRespin;

  // Build full 3x3 reel view
  const r1Cells: MoneyComingCell[] = [
    { id: 'r1-0', value: getRandomSymbol(REEL_1_STRIP) },
    { id: 'r1-1', value: r1Val, isWin: isWin && r1Val !== 'blank' },
    { id: 'r1-2', value: getRandomSymbol(REEL_1_STRIP) }
  ];

  const r2Cells: MoneyComingCell[] = [
    { id: 'r2-0', value: getRandomSymbol(REEL_2_STRIP) },
    { id: 'r2-1', value: r2Val, isWin: isWin && r2Val !== 'blank' },
    { id: 'r2-2', value: getRandomSymbol(REEL_2_STRIP) }
  ];

  const r3Cells: MoneyComingCell[] = [
    { id: 'r3-0', value: getRandomSymbol(REEL_3_STRIP) },
    { id: 'r3-1', value: r3Val, isWin: isWin && r3Val !== 'blank' },
    { id: 'r3-2', value: getRandomSymbol(REEL_3_STRIP) }
  ];

  const spCells: MoneyComingSpecialCell[] = [
    { id: 'sp-0', value: getRandomSymbol(SPECIAL_REEL_STRIP) },
    { id: 'sp-1', value: spVal, isWin: isWin && spVal !== 'blank' },
    { id: 'sp-2', value: getRandomSymbol(SPECIAL_REEL_STRIP) }
  ];

  return {
    reels: [r1Cells, r2Cells, r3Cells],
    specialReel: spCells,
    paylineNumbers: [r1Val, r2Val, r3Val],
    paylineSpecial: spVal,
    formedNumber,
    baseWin,
    multiplier,
    totalWin,
    hasRespin,
    hasWheelBonus
  };
}
