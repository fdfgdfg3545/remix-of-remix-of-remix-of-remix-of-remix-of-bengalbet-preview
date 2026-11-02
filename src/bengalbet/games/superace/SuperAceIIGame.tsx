// @ts-nocheck
/**
 * JILI Super Ace II (Super Ace 11) - Official Recreation
 * 
 * Authentic Super Ace 2 / II Slot Experience (JILI Slot):
 * - 5 Reels x 4 Rows (1024 Ways to Win)
 * - 4-Step Elimination Multiplier Combo Ladder:
 *     Base Game: x1, x2, x3, x5
 *     Free Game: x2, x4, x6, x10
 * - Max Win: 14,000X
 * - Golden Bet (+50% Bet): Boosts Golden Card spawn rate from 28% to 55% and increases Scatter frequency!
 * - Golden Cards (Reels 2, 3, 4) flip to Little Joker or Big Joker when eliminated
 * - Big Joker card unleashes lightning strikes that transform other cards into Little Jokers
 * - Cascading / Tumbling reels with gravity drop and refill
 * - 3+ Scatters trigger 10 Free Spins with doubled multipliers (retrigger +5)
 * - Buy Bonus Feature: 50X Bet for instant 10 Free Spins round!
 * - Big Win, Mega Win, and Super Win celebration overlays with ticker & confetti
 * - Full Web Audio API synthesizer for BGM, reel clatters, card flips, win fanfares
 * - Desktop & Mobile responsive fit cabinet design in Royal Electric Indigo & 24K Gold
 * - Bilingual (Bengali / English)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Music, 
  Maximize, 
  Minimize, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  Trophy, 
  ChevronRight, 
  Plus, 
  Minus,
  Crown,
  Flame,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { superAceAudio } from './superAceAudio';
import { SuperAceCardGraphic } from './SuperAceCardGraphic';
import { BigJokerLightningOverlay } from './BigJokerLightningOverlay';
import { gameEngine } from '../../services/gameEngine';

interface SuperAceIIGameProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
  onSwitchToClassic?: () => void;
  onSwitchToDeluxe?: () => void;
}

export type SymbolType = 
  | 'A' 
  | 'K' 
  | 'Q' 
  | 'J' 
  | 'SPADE' 
  | 'HEART' 
  | 'DIAMOND' 
  | 'CLUB' 
  | 'LITTLE_JOKER' 
  | 'BIG_JOKER' 
  | 'SCATTER';

export interface CardCell {
  id: string;
  type: SymbolType;
  isGolden: boolean;
  isWinning?: boolean;
  isEliminating?: boolean;
  isJokerTransforming?: boolean;
  isLightningHit?: boolean;
}

// Authentic JILI Super Ace II Paytable (multipliers of base bet)
const PAYTABLE: Record<string, { [count: number]: number }> = {
  A: { 3: 0.5, 4: 1.5, 5: 2.5 },
  K: { 3: 0.4, 4: 1.0, 5: 2.0 },
  Q: { 3: 0.3, 4: 0.8, 5: 1.5 },
  J: { 3: 0.2, 4: 0.5, 5: 1.0 },
  SPADE: { 3: 0.15, 4: 0.35, 5: 0.75 },
  HEART: { 3: 0.15, 4: 0.35, 5: 0.75 },
  DIAMOND: { 3: 0.1, 4: 0.25, 5: 0.5 },
  CLUB: { 3: 0.1, 4: 0.25, 5: 0.5 },
};

const SYMBOL_POOL: SymbolType[] = [
  'A', 'A', 'A',
  'K', 'K', 'K', 'K',
  'Q', 'Q', 'Q', 'Q', 'Q',
  'J', 'J', 'J', 'J', 'J', 'J',
  'SPADE', 'SPADE', 'SPADE', 'SPADE', 'SPADE',
  'HEART', 'HEART', 'HEART', 'HEART', 'HEART',
  'DIAMOND', 'DIAMOND', 'DIAMOND', 'DIAMOND', 'DIAMOND', 'DIAMOND',
  'CLUB', 'CLUB', 'CLUB', 'CLUB', 'CLUB', 'CLUB',
  'SCATTER'
];

const BET_PRESETS = [10, 20, 50, 100, 200, 500, 1000];
const AUTO_SPIN_OPTIONS = [10, 25, 50, 100, 500];

export const SuperAceIIGame: React.FC<SuperAceIIGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance,
  onSwitchToClassic,
  onSwitchToDeluxe
}) => {
  // Game states
  const [balance, setBalance] = useState<number>(() => user.balance || 2500);
  const [baseBetAmount, setBaseBetAmount] = useState<number>(50);
  const [isGoldenBet, setIsGoldenBet] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Total wager considering Golden Bet (+50%)
  const effectiveBet = useMemo(() => {
    return isGoldenBet ? Math.round(baseBetAmount * 1.5) : baseBetAmount;
  }, [baseBetAmount, isGoldenBet]);

  // Free Game (Free Spins) state
  const [isFreeGame, setIsFreeGame] = useState<boolean>(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeGameTotalWin, setFreeGameTotalWin] = useState<number>(0);
  const [showFreeGameTriggerModal, setShowFreeGameTriggerModal] = useState<boolean>(false);
  const [showFreeGameSummaryModal, setShowFreeGameSummaryModal] = useState<boolean>(false);

  // Multipliers & Cascade steps: 0, 1, 2, 3 (Classic 4-step ladder: x1, x2, x3, x5 / x2, x4, x6, x10)
  const [comboMultiplierStep, setComboMultiplierStep] = useState<number>(0);
  const [currentWin, setCurrentWin] = useState<number>(0);
  const [lastRoundWin, setLastRoundWin] = useState<number>(0);
  const [winningWaysCount, setWinningWaysCount] = useState<number>(0);

  // Modals & Overlays
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showAutoModal, setShowAutoModal] = useState<boolean>(false);
  const [showBuyBonusModal, setShowBuyBonusModal] = useState<boolean>(false);
  const [celebration, setCelebration] = useState<{
    tier: 'BIG' | 'MEGA' | 'SUPER';
    amount: number;
  } | null>(null);

  // Big Joker lightning animation state
  const [bigJokerSource, setBigJokerSource] = useState<{ col: number; row: number } | null>(null);
  const [lightningTargets, setLightningTargets] = useState<{ row: number; col: number }[]>([]);

  // 5 Reels x 4 Rows grid: grid[col][row]
  const [grid, setGrid] = useState<CardCell[][]>(() => generateInitialGrid());

  const containerRef = useRef<HTMLDivElement>(null);
  const spinLockRef = useRef<boolean>(false);

  // Synchronize balance updates to parent account
  const updateBalanceState = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  // Audio lifecycle
  useEffect(() => {
    superAceAudio.setSoundEnabled(soundOn);
    superAceAudio.setMusicEnabled(musicOn);
    superAceAudio.startMusic(isFreeGame);

    return () => {
      superAceAudio.stopMusic();
    };
  }, [soundOn, musicOn, isFreeGame]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Keyboard shortcut: Spacebar to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !showRulesModal && !showAutoModal && !celebration && !showBuyBonusModal) {
        e.preventDefault();
        if (!isSpinning && (balance >= effectiveBet || isFreeGame)) {
          handleSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, balance, effectiveBet, isFreeGame, celebration, showRulesModal, showAutoModal, showBuyBonusModal]);

  // Multiplier ladders
  // Normal game: x1, x2, x3, x5
  // Free game: x2, x4, x6, x10
  const currentMultiplierValue = useMemo(() => {
    if (isFreeGame) {
      switch (comboMultiplierStep) {
        case 0: return 2;
        case 1: return 4;
        case 2: return 6;
        default: return 10;
      }
    } else {
      switch (comboMultiplierStep) {
        case 0: return 1;
        case 1: return 2;
        case 2: return 3;
        default: return 5;
      }
    }
  }, [isFreeGame, comboMultiplierStep]);

  // Generate random card cell
  function generateRandomCell(colIndex: number): CardCell {
    const type = SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
    // Golden Cards can only appear on Reels 2, 3, and 4 (indices 1, 2, 3)
    const canBeGolden = (colIndex === 1 || colIndex === 2 || colIndex === 3) && 
                        type !== 'SCATTER' && 
                        type !== 'LITTLE_JOKER' && 
                        type !== 'BIG_JOKER';
    
    // In Super Ace II, Golden Bet boosts Golden spawn rate from 28% to 55%!
    const goldenThreshold = isGoldenBet ? 0.55 : 0.28;
    const isGolden = canBeGolden && Math.random() < goldenThreshold;

    return {
      id: `card-${Math.random().toString(36).substring(2, 9)}`,
      type,
      isGolden
    };
  }

  function generateInitialGrid(): CardCell[][] {
    const newGrid: CardCell[][] = [];
    for (let c = 0; c < 5; c++) {
      const col: CardCell[] = [];
      for (let r = 0; r < 4; r++) {
        col.push(generateRandomCell(c));
      }
      newGrid.push(col);
    }
    return newGrid;
  }

  // 1024 Ways evaluation algorithm
  function evaluateWays(currentGrid: CardCell[][]): {
    winningLines: {
      symbol: SymbolType;
      count: number;
      ways: number;
      winAmount: number;
      matchingCoordinates: { col: number; row: number }[];
    }[];
    totalWin: number;
    winningCardsMap: boolean[][];
    scatterCount: number;
    scatterCoords: { col: number; row: number }[];
  } {
    const winningCardsMap: boolean[][] = Array(5).fill(null).map(() => Array(4).fill(false));
    const regularSymbols: SymbolType[] = ['A', 'K', 'Q', 'J', 'SPADE', 'HEART', 'DIAMOND', 'CLUB'];
    const winningLines: {
      symbol: SymbolType;
      count: number;
      ways: number;
      winAmount: number;
      matchingCoordinates: { col: number; row: number }[];
    }[] = [];

    let totalPayout = 0;

    for (const sym of regularSymbols) {
      const reelMatches: { row: number; col: number }[][] = [];

      for (let col = 0; col < 5; col++) {
        const matchesInCol: { row: number; col: number }[] = [];
        for (let row = 0; row < 4; row++) {
          const card = currentGrid[col][row];
          if (card.type === sym || card.type === 'LITTLE_JOKER' || card.type === 'BIG_JOKER') {
            matchesInCol.push({ col, row });
          }
        }
        if (matchesInCol.length > 0) {
          reelMatches.push(matchesInCol);
        } else {
          break; // Must be consecutive from left to right (Reel 1 onwards)
        }
      }

      const matchLength = reelMatches.length;
      if (matchLength >= 3) {
        let ways = 1;
        const allCoords: { col: number; row: number }[] = [];
        for (let c = 0; c < matchLength; c++) {
          ways *= reelMatches[c].length;
          allCoords.push(...reelMatches[c]);
        }

        const symbolPayout = PAYTABLE[sym]?.[matchLength] || 0;
        const lineWin = symbolPayout * ways * baseBetAmount;
        totalPayout += lineWin;

        winningLines.push({
          symbol: sym,
          count: matchLength,
          ways,
          winAmount: lineWin,
          matchingCoordinates: allCoords
        });

        allCoords.forEach(coord => {
          winningCardsMap[coord.col][coord.row] = true;
        });
      }
    }

    // Evaluate Scatters
    const scatterCoords: { col: number; row: number }[] = [];
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 4; r++) {
        if (currentGrid[c][r].type === 'SCATTER') {
          scatterCoords.push({ col: c, row: r });
        }
      }
    }

    return {
      winningLines,
      totalWin: totalPayout,
      winningCardsMap,
      scatterCount: scatterCoords.length,
      scatterCoords
    };
  }

  // ================= MAIN SPIN CYCLE WITH CASCADING =================
  const handleSpin = async (forcedFreeSpin = false, forceBuyBonus = false) => {
    if (spinLockRef.current) return;
    const isFreeRound = forcedFreeSpin || isFreeGame;

    if (!isFreeRound && !forceBuyBonus && balance < effectiveBet) {
      superAceAudio.playButtonClick();
      return;
    }

    spinLockRef.current = true;
    setIsSpinning(true);
    setWinningWaysCount(0);
    setComboMultiplierStep(0);
    setCurrentWin(0);

    // Deduct bet if normal spin
    if (!isFreeRound && !forceBuyBonus) {
      const newBal = balance - effectiveBet;
      updateBalanceState(newBal);
    }

    superAceAudio.playSpin();

    // 1. Initial Spin Fall
    const rollDuration = isTurbo ? 320 : 650;
    await new Promise(r => setTimeout(r, rollDuration));

    let activeGrid: CardCell[][] = generateInitialGrid();

    // If Buy Bonus was purchased, guarantee 3 or 4 Scatters
    if (forceBuyBonus) {
      const scatCols = [0, 2, 4];
      scatCols.forEach(col => {
        const randRow = Math.floor(Math.random() * 4);
        activeGrid[col][randRow] = {
          id: `scatter-${Math.random()}`,
          type: 'SCATTER',
          isGolden: false
        };
      });
    }

    setGrid(activeGrid);
    superAceAudio.playReelStop();

    // 2. Cascade Loop
    let roundTotalWin = 0;
    let comboStep = 0;
    let cascadeActive = true;
    let cascadeCount = 0;

    while (cascadeActive) {
      cascadeCount++;
      const evalResult = evaluateWays(activeGrid);

      // Check Scatters trigger Free Game
      if (evalResult.scatterCount >= 3 && !isFreeRound) {
        superAceAudio.playScatterTrigger();
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 }
        });
        setShowFreeGameTriggerModal(true);
        setIsFreeGame(true);
        setFreeSpinsRemaining(10);
        setFreeGameTotalWin(0);
      } else if (evalResult.scatterCount >= 3 && isFreeRound) {
        // Retrigger +5 Free Spins
        superAceAudio.playScatterTrigger();
        setFreeSpinsRemaining(prev => prev + 5);
      }

      if (evalResult.winningLines.length > 0) {
        const stepMultiplier = isFreeRound
          ? (comboStep === 0 ? 2 : comboStep === 1 ? 4 : comboStep === 2 ? 6 : 10)
          : (comboStep === 0 ? 1 : comboStep === 1 ? 2 : comboStep === 2 ? 3 : 5);

        const cascadeWin = evalResult.totalWin * stepMultiplier;
        roundTotalWin += cascadeWin;
        setCurrentWin(roundTotalWin);
        setWinningWaysCount(evalResult.winningLines.reduce((acc, l) => acc + l.ways, 0));

        // Mark winning cards
        const markedGrid = activeGrid.map((colArr, c) =>
          colArr.map((cell, r) => ({
            ...cell,
            isWinning: evalResult.winningCardsMap[c][r]
          }))
        );
        setGrid(markedGrid);
        superAceAudio.playWinEliminate();

        const animDelay = isTurbo ? 350 : 600;
        await new Promise(r => setTimeout(r, animDelay));

        // 3. Transform Golden Cards into Jokers
        let hasBigJokerSpawn = false;
        let bigJokerLocation: { col: number; row: number } | null = null;

        const transformedGrid: CardCell[][] = markedGrid.map((colArr, c) =>
          colArr.map((cell, r) => {
            if (cell.isWinning && cell.isGolden) {
              const isBigJoker = Math.random() < 0.35; // 35% chance to be Big Joker
              if (isBigJoker && !hasBigJokerSpawn) {
                hasBigJokerSpawn = true;
                bigJokerLocation = { col: c, row: r };
                return {
                  id: `joker-b-${Math.random()}`,
                  type: 'BIG_JOKER' as SymbolType,
                  isGolden: false,
                  isJokerTransforming: true
                };
              }
              return {
                id: `joker-l-${Math.random()}`,
                type: 'LITTLE_JOKER' as SymbolType,
                isGolden: false,
                isJokerTransforming: true
              };
            }
            return cell;
          })
        );

        setGrid(transformedGrid);
        superAceAudio.playCardFlip();

        // 4. Big Joker Lightning Strike Feature
        if (hasBigJokerSpawn && bigJokerLocation) {
          await new Promise(r => setTimeout(r, isTurbo ? 250 : 450));
          superAceAudio.playBigJokerLightning();

          // Pick 1 to 3 non-wild cards on the board to transform into Little Jokers
          const eligibleTargets: { col: number; row: number }[] = [];
          for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 4; row++) {
              const cell = transformedGrid[col][row];
              if (
                cell.type !== 'BIG_JOKER' &&
                cell.type !== 'LITTLE_JOKER' &&
                cell.type !== 'SCATTER'
              ) {
                eligibleTargets.push({ col, row });
              }
            }
          }

          // Shuffle & pick up to 3 targets
          const targets = eligibleTargets.sort(() => 0.5 - Math.random()).slice(0, Math.min(3, eligibleTargets.length));
          setBigJokerSource(bigJokerLocation);
          setLightningTargets(targets.map(t => ({ col: t.col, row: t.row })));

          await new Promise(r => setTimeout(r, isTurbo ? 500 : 800));

          // Apply transformations to targets
          targets.forEach(t => {
            transformedGrid[t.col][t.row] = {
              id: `joker-lightning-${Math.random()}`,
              type: 'LITTLE_JOKER' as SymbolType,
              isGolden: false,
              isLightningHit: true
            };
          });

          setGrid([...transformedGrid]);
          await new Promise(r => setTimeout(r, isTurbo ? 200 : 400));
          setBigJokerSource(null);
          setLightningTargets([]);
        }

        // 5. Tumble Drop & Refill
        await new Promise(r => setTimeout(r, isTurbo ? 250 : 450));
        const droppedGrid: CardCell[][] = [];

        for (let col = 0; col < 5; col++) {
          const survivingCells: CardCell[] = [];
          for (let row = 0; row < 4; row++) {
            const cell = transformedGrid[col][row];
            if (!cell.isWinning || cell.type === 'LITTLE_JOKER' || cell.type === 'BIG_JOKER') {
              survivingCells.push({
                ...cell,
                isWinning: false,
                isJokerTransforming: false,
                isLightningHit: false
              });
            }
          }

          // Fill empty top rows with fresh random cards
          const needed = 4 - survivingCells.length;
          const newCells: CardCell[] = [];
          for (let i = 0; i < needed; i++) {
            newCells.push(generateRandomCell(col));
          }

          droppedGrid.push([...newCells, ...survivingCells]);
        }

        activeGrid = droppedGrid;
        setGrid(droppedGrid);
        superAceAudio.playCascadeDrop();

        // Advance combo multiplier step (up to max 3 = 4th tier)
        comboStep = Math.min(comboStep + 1, 3);
        setComboMultiplierStep(comboStep);

        await new Promise(r => setTimeout(r, isTurbo ? 200 : 400));
      } else {
        // No further winning ways: cascade ends
        cascadeActive = false;
      }
    }

    // Conclude round
    setLastRoundWin(roundTotalWin);

    if (roundTotalWin > 0) {
      if (isFreeRound) {
        setFreeGameTotalWin(prev => prev + roundTotalWin);
      }
      const newBal = balance + roundTotalWin;
      updateBalanceState(newBal);

      if (!isFreeRound) {
        gameEngine.recordRound(baseBetAmount, roundTotalWin, {
          gameId: 'game-super-ace-2',
          gameName: 'Super Ace II',
          category: 'slot',
          vendor: 'JILI'
        });
      }

      // Trigger Celebration for high multiplier wins
      const winMultiplier = roundTotalWin / baseBetAmount;
      if (winMultiplier >= 50) {
        setCelebration({ tier: 'SUPER', amount: roundTotalWin });
        superAceAudio.playBigWinCelebration('SUPER');
      } else if (winMultiplier >= 25) {
        setCelebration({ tier: 'MEGA', amount: roundTotalWin });
        superAceAudio.playBigWinCelebration('MEGA');
      } else if (winMultiplier >= 10) {
        setCelebration({ tier: 'BIG', amount: roundTotalWin });
        superAceAudio.playBigWinCelebration('BIG');
      }
    } else {
      if (!isFreeRound) {
        gameEngine.recordRound(baseBetAmount, 0, {
          gameId: 'game-super-ace-2',
          gameName: 'Super Ace II',
          category: 'slot',
          vendor: 'JILI'
        });
      }
    }

    setIsSpinning(false);
    spinLockRef.current = false;

    // Handle Free Spin Counter or Autoplay Continuation
    if (isFreeRound) {
      if (freeSpinsRemaining > 1) {
        setFreeSpinsRemaining(prev => prev - 1);
        setTimeout(() => {
          handleSpin(true);
        }, isTurbo ? 400 : 900);
      } else {
        // Free Spins finished!
        setFreeSpinsRemaining(0);
        setIsFreeGame(false);
        setShowFreeGameSummaryModal(true);
      }
    } else if (autoSpinsRemaining > 0) {
      setAutoSpinsRemaining(prev => prev - 1);
      setTimeout(() => {
        handleSpin();
      }, isTurbo ? 350 : 800);
    }
  };

  // Buy Bonus handler (50x Bet)
  const handleConfirmBuyBonus = () => {
    const cost = baseBetAmount * 50;
    if (balance < cost) {
      superAceAudio.playButtonClick();
      return;
    }
    setShowBuyBonusModal(false);
    const newBal = balance - cost;
    updateBalanceState(newBal);
    handleSpin(false, true);
  };

  return (
    <div 
      ref={containerRef}
      id="super-ace-ii-game-cabinet"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#0b0817] via-[#140f2d] to-[#080512] text-white select-none overflow-hidden font-sans"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ================= 1. HEADER BAR ================= */}
      <header className="relative z-20 w-full px-3 py-1.5 sm:py-2 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-purple-500/20 shadow-md">
        
        {/* Left: Close & Game Brand Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title="Exit Game"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-xl drop-shadow">👑</span>
            <div className="flex items-center gap-1">
              <h1 className="text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500 font-serif uppercase">
                SUPER ACE
              </h1>
              {/* Glowing Roman Numeral II (Super Ace 11) */}
              <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black shadow-[0_0_12px_rgba(234,179,8,0.8)] tracking-widest font-mono">
                II
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Account Balance */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-950/70 via-black to-purple-950/70 border border-purple-500/40 shadow-inner">
          <span className="text-[10px] sm:text-xs font-bold text-purple-300 uppercase tracking-wider">
            {language === 'bn' ? 'ব্যালেন্স' : 'BALANCE'}:
          </span>
          <span className="text-xs sm:text-sm md:text-base font-black font-mono text-yellow-300 drop-shadow">
            ৳ {balance.toLocaleString()}
          </span>
        </div>

        {/* Right: Sound, Rules, Fullscreen & Edition Switcher */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Quick Switch to Classic or Deluxe */}
          {onSwitchToClassic && (
            <button
              onClick={onSwitchToClassic}
              disabled={isSpinning || isFreeGame}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer"
              title="Classic Edition"
            >
              <span>Classic</span>
            </button>
          )}

          {onSwitchToDeluxe && (
            <button
              onClick={onSwitchToDeluxe}
              disabled={isSpinning || isFreeGame}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer"
              title="Deluxe Edition"
            >
              <span>Deluxe</span>
            </button>
          )}

          <button
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              superAceAudio.setSoundEnabled(next);
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title="SFX"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />}
          </button>

          <button
            onClick={() => {
              const next = !musicOn;
              setMusicOn(next);
              superAceAudio.setMusicEnabled(next);
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title="Music"
          >
            <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${musicOn ? 'text-amber-400' : 'text-neutral-500'}`} />
          </button>

          <button
            onClick={() => {
              superAceAudio.playButtonClick();
              setShowRulesModal(true);
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title="Rules & Paytable"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* ================= 2. MULTIPLIER METER (4-STEP COMBO LADDER) ================= */}
      <div className="relative z-10 w-full max-w-2xl px-2 sm:px-4 pt-1 flex items-center justify-between gap-1.5">
        
        {/* Left: Ways & Status Badge */}
        <div className="flex items-center gap-1.5">
          <div className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-[10px] font-mono font-bold text-indigo-300 shadow">
            1024 {language === 'bn' ? 'উপায়' : 'WAYS'}
          </div>
          {isFreeGame && (
            <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[10px] font-black animate-pulse shadow">
              {language === 'bn' ? 'ফ্রি স্পিন' : 'FREE SPIN'} ({freeSpinsRemaining})
            </div>
          )}
        </div>

        {/* Center: Elimination Multiplier Step Bar (x1, x2, x3, x5 or Free Game x2, x4, x6, x10) */}
        <div className="flex items-center gap-1 p-1 bg-black/60 rounded-xl border border-purple-500/30 shadow-inner">
          {[
            { step: 0, norm: 'x1', free: 'x2' },
            { step: 1, norm: 'x2', free: 'x4' },
            { step: 2, norm: 'x3', free: 'x6' },
            { step: 3, norm: 'x5', free: 'x10' },
          ].map(m => {
            const isCurrent = comboMultiplierStep === m.step;
            const isPassed = comboMultiplierStep > m.step;
            const text = isFreeGame ? m.free : m.norm;

            return (
              <div
                key={`combo-${m.step}`}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black transition-all duration-300 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black scale-110 shadow-[0_0_14px_rgba(234,179,8,0.9)] ring-2 ring-yellow-300'
                    : isPassed
                    ? 'bg-amber-600/40 text-amber-300 border border-amber-500/50'
                    : 'bg-neutral-900/70 text-neutral-400 border border-neutral-800'
                }`}
              >
                {text}
              </div>
            );
          })}
        </div>

        {/* Right: Round Win Display */}
        <div className="flex items-center gap-1 text-right">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">
            {language === 'bn' ? 'জয়' : 'WIN'}:
          </div>
          <div className="text-xs sm:text-sm font-black font-mono text-amber-400">
            ৳ {currentWin.toLocaleString()}
          </div>
        </div>
      </div>

      {/* ================= 3. MAIN 5x4 REEL GRID CABINET ================= */}
      <main className="relative z-10 w-full flex-1 max-w-2xl px-2 sm:px-4 py-1 flex items-center justify-center">
        <div className="relative w-full aspect-[5/4] max-h-[62vh] rounded-2xl bg-gradient-to-b from-[#130d2d] via-[#100a26] to-[#090518] p-1.5 sm:p-2.5 border-2 border-amber-500/40 shadow-[0_0_35px_rgba(147,51,234,0.35)] flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Inner Felt Texture & Grid Guides */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,50,220,0.12)_0%,_transparent_75%)] pointer-events-none" />
          
          {/* 5 Column Grid */}
          <div className="relative w-full h-full grid grid-cols-5 gap-1 sm:gap-1.5 z-10">
            {grid.map((column, colIdx) => (
              <div 
                key={`col-${colIdx}`}
                className="w-full h-full grid grid-rows-4 gap-1 sm:gap-1.5"
              >
                {column.map((cell, rowIdx) => (
                  <div
                    key={cell.id}
                    className={`relative w-full h-full rounded-lg sm:rounded-xl transition-all duration-200 overflow-hidden ${
                      cell.isWinning 
                        ? 'ring-2 sm:ring-4 ring-yellow-400 scale-102 shadow-[0_0_20px_rgba(250,204,21,0.9)] animate-pulse z-20' 
                        : cell.isLightningHit
                        ? 'ring-2 ring-cyan-400 scale-105 shadow-[0_0_25px_rgba(34,211,238,0.9)] z-20'
                        : cell.isGolden
                        ? 'border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                        : 'border border-purple-900/40 hover:border-purple-500/40'
                    }`}
                  >
                    <SuperAceCardGraphic 
                      type={cell.type} 
                      isGolden={cell.isGolden} 
                      isSpinning={isSpinning}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Big Joker Lightning Strike Overlay Canvas */}
          {bigJokerSource && lightningTargets.length > 0 && (
            <BigJokerLightningOverlay
              source={bigJokerSource}
              targets={lightningTargets}
            />
          )}

          {/* Winning Ways Banner */}
          {winningWaysCount > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black text-xs font-black shadow-lg uppercase tracking-wider flex items-center gap-1 animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{winningWaysCount} {language === 'bn' ? 'জেতার পথ!' : 'WAYS TO WIN!'}</span>
            </div>
          )}
        </div>
      </main>

      {/* ================= 4. CONTROLS & BETTING CONSOLE ================= */}
      <footer className="relative z-20 w-full max-w-2xl px-2 sm:px-4 pb-2 sm:pb-3 flex flex-col gap-1.5 bg-black/70 backdrop-blur-md pt-1.5 border-t border-purple-500/20">
        
        {/* Row A: Golden Bet (+50%) & Buy Bonus Bar */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Golden Bet Toggle (Ante Bet +50%) */}
          <button
            onClick={() => {
              if (isSpinning || isFreeGame) return;
              superAceAudio.playButtonClick();
              setIsGoldenBet(!isGoldenBet);
            }}
            disabled={isSpinning || isFreeGame}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              isGoldenBet
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-200 shadow-[0_0_14px_rgba(245,158,11,0.6)] font-black scale-102'
                : 'bg-neutral-900/80 border-amber-500/30 text-amber-300 hover:border-amber-400/60'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>
              {language === 'bn' ? 'গোল্ডেন বেট (+৫০%)' : 'GOLDEN BET (+50%)'}
            </span>
            <span className={`text-[9px] px-1 rounded ${isGoldenBet ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {isGoldenBet ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Buy Bonus Feature (50X) */}
          <button
            onClick={() => {
              if (isSpinning || isFreeGame) return;
              superAceAudio.playButtonClick();
              setShowBuyBonusModal(true);
            }}
            disabled={isSpinning || isFreeGame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white text-[11px] sm:text-xs font-black border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'bn' ? 'বোনাস কিনুন' : 'BUY BONUS'}</span>
            <span className="text-[10px] text-amber-300 font-mono">50X</span>
          </button>
        </div>

        {/* Row B: Quick Bet Chips */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {BET_PRESETS.map(val => (
            <button
              key={`chip-${val}`}
              onClick={() => {
                if (isSpinning || isFreeGame) return;
                superAceAudio.playButtonClick();
                setBaseBetAmount(val);
              }}
              disabled={isSpinning || isFreeGame}
              className={`flex-1 min-w-[40px] px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                baseBetAmount === val 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow font-black border border-white' 
                  : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              ৳{val}
            </button>
          ))}
        </div>

        {/* Row C: Main Spin Action Bar */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Bet Stepper & Total Wager Display */}
          <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-purple-500/30">
            <button
              onClick={() => {
                if (isSpinning || isFreeGame) return;
                superAceAudio.playButtonClick();
                setBaseBetAmount(prev => Math.max(10, prev - 10));
              }}
              disabled={isSpinning || isFreeGame || baseBetAmount <= 10}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2 text-center">
              <span className="block text-[9px] text-purple-300 font-bold uppercase">
                {language === 'bn' ? 'মোট বাজি' : 'TOTAL BET'}
              </span>
              <span className="text-xs sm:text-sm font-black font-mono text-yellow-300">
                ৳{effectiveBet}
              </span>
            </div>

            <button
              onClick={() => {
                if (isSpinning || isFreeGame) return;
                superAceAudio.playButtonClick();
                setBaseBetAmount(prev => Math.min(1000, prev + 10));
              }}
              disabled={isSpinning || isFreeGame || baseBetAmount >= 1000}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: BIG GOLDEN SPIN BUTTON */}
          <button
            onClick={() => handleSpin()}
            disabled={isSpinning || (balance < effectiveBet && !isFreeGame)}
            className={`flex-1 max-w-[200px] py-2 sm:py-2.5 px-4 rounded-2xl font-black text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isSpinning 
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black hover:brightness-110 active:scale-95 shadow-[0_0_22px_rgba(245,158,11,0.6)] ring-2 ring-yellow-200/60'
            }`}
          >
            {isSpinning ? (
              <RotateCcw className="w-5 h-5 animate-spin text-neutral-400" />
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                <span>{language === 'bn' ? 'স্পিন' : 'SPIN'}</span>
              </>
            )}
          </button>

          {/* Right: Turbo & Auto Spin */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                superAceAudio.playButtonClick();
                setIsTurbo(!isTurbo);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                isTurbo 
                  ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black' 
                  : 'bg-neutral-900/80 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Turbo Spin"
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                superAceAudio.playButtonClick();
                if (autoSpinsRemaining > 0) {
                  setAutoSpinsRemaining(0);
                } else {
                  setShowAutoModal(true);
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                autoSpinsRemaining > 0
                  ? 'bg-rose-600 text-white border-rose-400 font-black animate-pulse'
                  : 'bg-neutral-900/80 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
              title="Auto Spin"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{autoSpinsRemaining > 0 ? autoSpinsRemaining : 'AUTO'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ================= MODAL: BUY BONUS CONFIRMATION ================= */}
      {showBuyBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#1c133a] to-[#0c0818] border-2 border-purple-500/60 p-5 shadow-2xl text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg border border-purple-300">
              <Flame className="w-8 h-8 text-amber-300" />
            </div>

            <h3 className="text-lg font-black text-amber-300 font-serif">
              {language === 'bn' ? 'ফ্রি স্পিন ফিচার কিনুন' : 'BUY FREE SPINS'}
            </h3>

            <p className="text-xs text-neutral-300">
              {language === 'bn' 
                ? '১০টি ফ্রি স্পিন পান গ্যারান্টিযুক্ত ৩টি স্ক্যাটার সহ! ফ্রি স্পিনে গুণক দ্বিগুণ হবে (x2, x4, x6, x10)!' 
                : 'Instantly trigger 10 Free Spins with guaranteed 3 Scatters! Enjoy doubled elimination multipliers up to x10!'}
            </p>

            <div className="p-3 w-full rounded-xl bg-black/50 border border-purple-500/30 flex items-center justify-between text-sm">
              <span className="text-neutral-400 font-bold">
                {language === 'bn' ? 'মূল্য (৫০x বাজি)' : 'Cost (50x Bet)'}:
              </span>
              <span className="font-mono font-black text-yellow-300 text-base">
                ৳ {(baseBetAmount * 50).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full pt-2">
              <button
                onClick={() => setShowBuyBonusModal(false)}
                className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmBuyBonus}
                disabled={balance < baseBetAmount * 50}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-black font-black text-xs shadow-lg disabled:opacity-40 cursor-pointer"
              >
                {language === 'bn' ? 'কিনুন ও শুরু করুন' : 'Buy & Spin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUTO SPIN SELECTION ================= */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs rounded-2xl bg-neutral-900 border border-purple-500/50 p-4 text-center">
            <h3 className="text-sm font-black text-amber-300 uppercase mb-3">
              {language === 'bn' ? 'অটো স্পিন সংখ্যা' : 'SELECT AUTO SPINS'}
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {AUTO_SPIN_OPTIONS.map(count => (
                <button
                  key={`auto-${count}`}
                  onClick={() => {
                    superAceAudio.playButtonClick();
                    setAutoSpinsRemaining(count);
                    setShowAutoModal(false);
                    handleSpin();
                  }}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-purple-900/60 border border-purple-500/30 text-xs font-mono font-black text-white hover:text-amber-300 transition cursor-pointer"
                >
                  {count} {language === 'bn' ? 'রাউন্ড' : 'Spins'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAutoModal(false)}
              className="w-full py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs font-bold cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: FREE GAME TRIGGER BANNER ================= */}
      {showFreeGameTriggerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-purple-900 via-indigo-950 to-black border-2 border-amber-400 p-6 text-center shadow-[0_0_50px_rgba(250,204,21,0.6)] flex flex-col items-center gap-3">
            <div className="text-4xl animate-bounce">👑</div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 font-serif uppercase">
              {language === 'bn' ? 'ফ্রি স্পিন আনলক!' : '10 FREE SPINS!'}
            </h2>
            <p className="text-xs text-neutral-200">
              {language === 'bn'
                ? 'অভিনন্দন! ১০টি ফ্রি স্পিন অ্যাক্টিভেট হয়েছে। মাল্টিপ্লায়ার দ্বিগুণ হয়ে x2, x4, x6, x10 পর্যন্ত যাবে!'
                : 'Congratulations! 10 Free Spins awarded. Multipliers are doubled: x2, x4, x6, up to x10!'}
            </p>
            <button
              onClick={() => {
                setShowFreeGameTriggerModal(false);
                handleSpin(true);
              }}
              className="mt-2 w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer"
            >
              {language === 'bn' ? 'ফ্রি স্পিন শুরু করুন' : 'START FREE SPINS'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: FREE GAME SUMMARY ================= */}
      {showFreeGameSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-purple-900 via-indigo-950 to-black border-2 border-amber-400 p-6 text-center shadow-[0_0_50px_rgba(250,204,21,0.6)] flex flex-col items-center gap-3">
            <div className="text-4xl">🏆</div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 font-serif uppercase">
              {language === 'bn' ? 'ফ্রি গেম সমাপ্ত!' : 'FREE GAME COMPLETE!'}
            </h2>
            <p className="text-xs text-neutral-300">
              {language === 'bn' ? 'আপনার মোট ফ্রি গেম জয়:' : 'Total Free Game Winnings:'}
            </p>
            <div className="text-2xl font-black font-mono text-yellow-300 drop-shadow">
              ৳ {freeGameTotalWin.toLocaleString()}
            </div>
            <button
              onClick={() => setShowFreeGameSummaryModal(false)}
              className="mt-2 w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm uppercase shadow-lg hover:brightness-110 cursor-pointer"
            >
              {language === 'bn' ? 'সংগ্রহ করুন' : 'COLLECT'}
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: BIG / MEGA / SUPER WIN CELEBRATION ================= */}
      {celebration && (
        <div 
          onClick={() => setCelebration(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div className="text-center flex flex-col items-center gap-2">
            <div className="text-5xl animate-bounce">
              {celebration.tier === 'SUPER' ? '🔥' : celebration.tier === 'MEGA' ? '💎' : '⭐'}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 font-serif uppercase drop-shadow-[0_4px_20px_rgba(250,204,21,0.8)] tracking-wider">
              {celebration.tier} WIN!
            </h2>
            <div className="text-2xl sm:text-4xl font-mono font-black text-white drop-shadow">
              ৳ {celebration.amount.toLocaleString()}
            </div>
            <span className="text-xs text-neutral-400 mt-2">
              {language === 'bn' ? 'চালিয়ে যেতে ক্লিক করুন' : 'Click anywhere to continue'}
            </span>
          </div>
        </div>
      )}

      {/* ================= MODAL: GAME RULES & PAYTABLE ================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-neutral-900 border border-purple-500/50 p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-base font-black text-amber-300 uppercase">
                  {language === 'bn' ? 'সুপার এস II খেলার নিয়ম' : 'SUPER ACE II RULES & PAYTABLE'}
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs text-neutral-300 pr-1">
              <div>
                <h4 className="font-black text-amber-400 mb-1">
                  1. {language === 'bn' ? '১০২৪ জয়ের উপায় (Ways to Win)' : '1024 Ways to Win'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'সবগুলো জয় বামদিকের প্রথম রিল থেকে শুরু করে ডানদিকে পরপর রিলে সংযুক্ত হতে হবে।'
                    : 'All winning combinations pay from leftmost reel to right on consecutive reels.'}
                </p>
              </div>

              <div>
                <h4 className="font-black text-amber-400 mb-1">
                  2. {language === 'bn' ? 'গোল্ডেন কার্ড ও জোকার' : 'Golden Cards & Jokers'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'গোল্ডেন কার্ড ২, ৩ এবং ৪ নম্বর রিলে উপস্থিত হয়। যেকোনো জয়ী কম্বিনেশনে থাকার পর গোল্ডেন কার্ড লিটল জোকার বা বিগ জোকারে রূপান্তরিত হয়। বিগ জোকার বজ্রপাতের মাধ্যমে অন্যান্য কার্ডকে জোকারে পরিবর্তন করে।'
                    : 'Golden Cards appear on reels 2, 3, and 4. When part of a win, they transform into Little Jokers or Big Jokers. Big Joker unleashes lightning to turn other cards into Jokers.'}
                </p>
              </div>

              <div>
                <h4 className="font-black text-amber-400 mb-1">
                  3. {language === 'bn' ? 'এলিমিনেশন গুণক (Combo Multiplier)' : 'Elimination Multiplier'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'বেস গেমে পর পর কম্বো জয়ের জন্য গুণক x1, x2, x3, x5 হবে। ফ্রি গেমে গুণক দ্বিগুণ হয়ে x2, x4, x6, x10 হবে!'
                    : 'Consecutive cascade wins trigger multipliers of x1, x2, x3, x5. In Free Spins, multipliers double to x2, x4, x6, x10!'}
                </p>
              </div>

              <div>
                <h4 className="font-black text-amber-400 mb-1">
                  4. {language === 'bn' ? 'গোল্ডেন বেট (+৫০%)' : 'Golden Bet (+50%)'}
                </h4>
                <p>
                  {language === 'bn'
                    ? 'গোল্ডেন বেট অন করলে বাজির উপর ৫০% যোগ হবে এবং গোল্ডেন কার্ড ও স্ক্যাটার আসার সম্ভাবনা দ্বিগুণ হয়ে যায়!'
                    : 'Activating Golden Bet adds 50% to total wager and significantly increases the chance of landing Golden Cards and Scatters!'}
                </p>
              </div>

              <div>
                <h4 className="font-black text-amber-400 mb-1">
                  5. {language === 'bn' ? 'বোনাস ক্রয় (Buy Bonus)' : 'Buy Bonus'}
                </h4>
                <p>
                  {language === 'bn'
                    ? '৫০ গুণ বাজি খরচ করে তাৎক্ষণিক ১০টি ফ্রি স্পিন রাউন্ড কেনা যায়।'
                    : 'Instantly purchase the 10 Free Spins bonus round for 50x your base bet.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full mt-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase"
            >
              {language === 'bn' ? 'বুঝেছি' : 'GOT IT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
