// @ts-nocheck
/**
 * JILI Super Ace (Classic) - Official Recreation
 * 
 * Authentic Classic Super Ace Slot Experience:
 * - 5 Reels x 4 Rows (1024 Ways to Win)
 * - 4-Step Elimination Multiplier Ladder:
 *     Base Game: x1, x2, x3, x5
 *     Free Game: x2, x4, x6, x10
 * - Max Win: 1,500X
 * - Golden Cards (Reels 2, 3, 4) flip to Little Joker or Big Joker when eliminated
 * - Big Joker card unleashes lightning strikes that transform other cards into Little Jokers
 * - Cascading / Tumbling reels with gravity drop and refill
 * - 3+ Scatters trigger 10 Free Spins with doubled multipliers (retrigger +5)
 * - Big Win, Mega Win, and Super Win celebration overlays with ticker & confetti
 * - Full Web Audio API synthesizer for BGM, reel clatters, card flips, win fanfares
 * - Desktop & Mobile responsive fit cabinet design in Classic Emerald Green Poker Felt
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
  Plus, 
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { superAceAudio } from './superAceAudio';
import { SuperAceCardGraphic } from './SuperAceCardGraphic';
import { BigJokerLightningOverlay } from './BigJokerLightningOverlay';
import { gameEngine } from '../../services/gameEngine';

interface SuperAceGameProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
  onSwitchToDeluxe?: () => void;
  onSwitchToSuperAce2?: () => void;
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

// Authentic JILI Super Ace Paytable (multipliers of total bet for 3, 4, 5 of a kind)
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

export const SuperAceGame: React.FC<SuperAceGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance,
  onSwitchToDeluxe,
  onSwitchToSuperAce2
}) => {
  // Game states
  const [balance, setBalance] = useState<number>(() => user.balance || 2500);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Free Game (Free Spins) state
  const [isFreeGame, setIsFreeGame] = useState<boolean>(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeGameTotalWin, setFreeGameTotalWin] = useState<number>(0);
  const [showFreeGameTriggerModal, setShowFreeGameTriggerModal] = useState<boolean>(false);
  const [showFreeGameSummaryModal, setShowFreeGameSummaryModal] = useState<boolean>(false);

  // Multipliers & Cascade steps: 0, 1, 2, 3 (Classic 4-step ladder: x1, x2, x3, x5)
  const [comboMultiplierStep, setComboMultiplierStep] = useState<number>(0);
  const [currentWin, setCurrentWin] = useState<number>(0);
  const [lastRoundWin, setLastRoundWin] = useState<number>(0);
  const [winningWaysCount, setWinningWaysCount] = useState<number>(0);

  // Modals & Overlays
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showAutoModal, setShowAutoModal] = useState<boolean>(false);
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
      if (e.code === 'Space' && !e.repeat && !showRulesModal && !showAutoModal && !celebration) {
        e.preventDefault();
        if (!isSpinning && (balance >= betAmount || isFreeGame)) {
          handleSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, balance, betAmount, isFreeGame, celebration, showRulesModal, showAutoModal]);

  // Multiplier ladders (Classic Super Ace: 4 Steps)
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
    const isGolden = canBeGolden && Math.random() < 0.28;

    return {
      id: `card-${Math.random().toString(36).substring(2, 9)}`,
      type,
      isGolden
    };
  }

  function generateInitialGrid(): CardCell[][] {
    const cols: CardCell[][] = [];
    for (let c = 0; c < 5; c++) {
      const col: CardCell[] = [];
      for (let r = 0; r < 4; r++) {
        col.push(generateRandomCell(c));
      }
      cols.push(col);
    }
    return cols;
  }

  // Handle auto spins loop
  useEffect(() => {
    if (autoSpinsRemaining > 0 && !isSpinning && !celebration && !showFreeGameTriggerModal && !showFreeGameSummaryModal) {
      const timer = setTimeout(() => {
        handleSpin();
      }, isTurbo ? 350 : 700);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, autoSpinsRemaining, celebration, showFreeGameTriggerModal, showFreeGameSummaryModal]);

  // MAIN SPIN EXECUTION (Classic Super Ace)
  const handleSpin = async () => {
    if (isSpinning) return;

    if (!isFreeGame) {
      if (balance < betAmount) {
        superAceAudio.playButtonClick();
        setAutoSpinsRemaining(0);
        return;
      }
      const newBal = balance - betAmount;
      updateBalanceState(newBal);
    } else {
      setFreeSpinsRemaining(prev => Math.max(0, prev - 1));
    }

    setIsSpinning(true);
    spinLockRef.current = true;
    setCurrentWin(0);
    setComboMultiplierStep(0);
    setLightningTargets([]);
    superAceAudio.playSpinStart();

    // 1. Spinning visual phase (column by column stop)
    const spinDelayBase = isTurbo ? 100 : 220;
    const finalGrid: CardCell[][] = [];

    for (let c = 0; c < 5; c++) {
      const col: CardCell[] = [];
      for (let r = 0; r < 4; r++) {
        const cell = generateRandomCell(c);
        col.push(cell);
      }
      finalGrid.push(col);
    }

    // Sequentially reveal reels 1 to 5
    for (let c = 0; c < 5; c++) {
      await new Promise(res => setTimeout(res, spinDelayBase));
      superAceAudio.playReelStop(c);

      const colScatters = finalGrid[c].filter(card => card.type === 'SCATTER').length;
      if (colScatters > 0) {
        superAceAudio.playScatterLand();
      }

      setGrid(prev => {
        const next = [...prev];
        next[c] = finalGrid[c];
        return next;
      });
    }

    await new Promise(res => setTimeout(res, isTurbo ? 150 : 300));

    // 2. Cascade / Evaluation Loop
    let currentActiveGrid = finalGrid.map(col => col.map(c => ({ ...c })));
    let roundTotalWin = 0;
    let comboStep = 0;
    let continueCascades = true;

    while (continueCascades) {
      const evalResult = evaluateWays(currentActiveGrid);

      if (!evalResult.hasWin) {
        continueCascades = false;
        break;
      }

      // We have wins!
      // Calculate multiplier for this cascade step (Classic: up to x5 base, up to x10 free game)
      const stepMultiplier = isFreeGame 
        ? (comboStep === 0 ? 2 : comboStep === 1 ? 4 : comboStep === 2 ? 6 : 10)
        : (comboStep === 0 ? 1 : comboStep === 1 ? 2 : comboStep === 2 ? 3 : 5);

      const stepWin = Math.max(1, Math.round(evalResult.basePayout * betAmount * stepMultiplier));
      roundTotalWin += stepWin;
      setCurrentWin(roundTotalWin);
      setWinningWaysCount(evalResult.totalWays);
      superAceAudio.playWinCascade(comboStep);

      // Mark winning cards for explosion effect
      const winGrid = currentActiveGrid.map(col => col.map(c => ({ ...c })));
      evalResult.winningCoords.forEach(({ c, r }) => {
        winGrid[c][r].isWinning = true;
      });
      setGrid(winGrid);
      superAceAudio.playEliminationExplosion();

      await new Promise(res => setTimeout(res, isTurbo ? 350 : 650));

      // Golden Card transformations to Little Joker or Big Joker
      const transformedGrid = winGrid.map(col => col.map(c => ({ ...c })));
      const jokersToAnimate: { col: number; row: number; isBig: boolean }[] = [];

      evalResult.winningCoords.forEach(({ c, r }) => {
        const card = transformedGrid[c][r];
        if (card.isGolden) {
          const isBig = Math.random() < 0.35; // 35% chance for Big Joker
          transformedGrid[c][r] = {
            ...card,
            type: isBig ? 'BIG_JOKER' : 'LITTLE_JOKER',
            isGolden: false,
            isWinning: false,
            isJokerTransforming: true
          };
          jokersToAnimate.push({ col: c, row: r, isBig });
        } else {
          transformedGrid[c][r].isEliminating = true;
        }
      });

      setGrid(transformedGrid);

      if (jokersToAnimate.length > 0) {
        superAceAudio.playGoldenFlip();
        await new Promise(res => setTimeout(res, isTurbo ? 300 : 500));

        // Big Joker lightning power
        const bigJokers = jokersToAnimate.filter(j => j.isBig);
        for (const bj of bigJokers) {
          setBigJokerSource({ col: bj.col, row: bj.row });
          superAceAudio.playBigJokerLightning();

          // Target 1 to 4 random non-wild, non-scatter positions on reels 2, 3, 4
          const availableTargets: { c: number; r: number }[] = [];
          [1, 2, 3].forEach(colIdx => {
            for (let rowIdx = 0; rowIdx < 4; rowIdx++) {
              if (
                (colIdx !== bj.col || rowIdx !== bj.row) &&
                transformedGrid[colIdx][rowIdx].type !== 'BIG_JOKER' &&
                transformedGrid[colIdx][rowIdx].type !== 'LITTLE_JOKER' &&
                transformedGrid[colIdx][rowIdx].type !== 'SCATTER'
              ) {
                availableTargets.push({ c: colIdx, r: rowIdx });
              }
            }
          });

          const strikeCount = Math.min(availableTargets.length, Math.floor(1 + Math.random() * 3));
          const chosenTargets = availableTargets.sort(() => Math.random() - 0.5).slice(0, strikeCount);

          setLightningTargets(chosenTargets.map(t => ({ col: t.c, row: t.r })));

          await new Promise(res => setTimeout(res, isTurbo ? 400 : 700));

          chosenTargets.forEach(t => {
            transformedGrid[t.c][t.r] = {
              id: `joker-spawn-${Math.random().toString(36).substring(2, 9)}`,
              type: 'LITTLE_JOKER',
              isGolden: false,
              isLightningHit: true
            };
          });

          setGrid(transformedGrid.map(col => col.map(c => ({ ...c }))));
          setBigJokerSource(null);
          setLightningTargets([]);
          await new Promise(res => setTimeout(res, isTurbo ? 200 : 350));
        }
      }

      // Gravity fall & replenish with new cards
      const nextActiveGrid: CardCell[][] = [];
      for (let c = 0; c < 5; c++) {
        const remainingInCol = transformedGrid[c].filter(card => !card.isEliminating);
        const needed = 4 - remainingInCol.length;
        const newCards: CardCell[] = [];
        for (let i = 0; i < needed; i++) {
          newCards.push(generateRandomCell(c));
        }
        nextActiveGrid.push([...newCards, ...remainingInCol]);
      }

      currentActiveGrid = nextActiveGrid;
      setGrid(currentActiveGrid);

      // Advance combo multiplier step (0 -> 1 -> 2 -> 3) for Classic Super Ace
      comboStep = Math.min(3, comboStep + 1);
      setComboMultiplierStep(comboStep);

      await new Promise(res => setTimeout(res, isTurbo ? 200 : 400));
    }

    // Round completed!
    setLastRoundWin(roundTotalWin);

    if (roundTotalWin > 0) {
      const winRatio = roundTotalWin / betAmount;
      if (winRatio >= 30) {
        setCelebration({ tier: 'SUPER', amount: roundTotalWin });
        superAceAudio.playCelebration('SUPER');
        confetti({ particleCount: 150, spread: 90 });
      } else if (winRatio >= 15) {
        setCelebration({ tier: 'MEGA', amount: roundTotalWin });
        superAceAudio.playCelebration('MEGA');
        confetti({ particleCount: 100, spread: 75 });
      } else if (winRatio >= 5) {
        setCelebration({ tier: 'BIG', amount: roundTotalWin });
        superAceAudio.playCelebration('BIG');
        confetti({ particleCount: 60, spread: 60 });
      }

      // Add to balance
      setBalance(prev => {
        const updated = prev + roundTotalWin;
        onUpdateBalance(updated);
        return updated;
      });

      if (!isFreeGame) {
        gameEngine.recordRound(betAmount, roundTotalWin, {
          gameId: 'game-super-ace',
          gameName: 'Super Ace',
          category: 'slot',
          vendor: 'JILI'
        });
      }

      if (isFreeGame) {
        setFreeGameTotalWin(prev => prev + roundTotalWin);
      }
    } else {
      if (!isFreeGame) {
        gameEngine.recordRound(betAmount, 0, {
          gameId: 'game-super-ace',
          gameName: 'Super Ace',
          category: 'slot',
          vendor: 'JILI'
        });
      }
    }

    // Check for Free Game Trigger (3 or more Scatters)
    let totalScatters = 0;
    currentActiveGrid.forEach(col => {
      col.forEach(card => {
        if (card.type === 'SCATTER') totalScatters++;
      });
    });

    if (totalScatters >= 3) {
      superAceAudio.playFreeGameTrigger();
      await new Promise(res => setTimeout(res, 600));

      if (!isFreeGame) {
        setShowFreeGameTriggerModal(true);
        setIsFreeGame(true);
        setFreeSpinsRemaining(10);
        setFreeGameTotalWin(0);
      } else {
        // Retrigger +5 spins!
        setFreeSpinsRemaining(prev => prev + 5);
      }
    }

    // Check Free Game completion
    if (isFreeGame && freeSpinsRemaining <= 1 && totalScatters < 3) {
      await new Promise(res => setTimeout(res, 800));
      setShowFreeGameSummaryModal(true);
      setIsFreeGame(false);
      setFreeSpinsRemaining(0);
    }

    setIsSpinning(false);
    spinLockRef.current = false;
    if (autoSpinsRemaining > 0) {
      setAutoSpinsRemaining(prev => prev - 1);
    }
  };

  // 1024 Ways Evaluation
  function evaluateWays(gridCols: CardCell[][]) {
    const symbolTypes: SymbolType[] = ['A', 'K', 'Q', 'J', 'SPADE', 'HEART', 'DIAMOND', 'CLUB'];
    let totalPayout = 0;
    let totalWays = 0;
    const winningCoords: { c: number; r: number }[] = [];
    let hasWin = false;

    for (const sym of symbolTypes) {
      const matchCountsPerCol: number[] = [];
      const matchPositionsPerCol: { c: number; r: number }[][] = [];

      for (let c = 0; c < 5; c++) {
        const colMatches: { c: number; r: number }[] = [];
        gridCols[c].forEach((card, r) => {
          if (card.type === sym || card.type === 'LITTLE_JOKER' || card.type === 'BIG_JOKER') {
            colMatches.push({ c, r });
          }
        });

        if (colMatches.length === 0) break;
        matchCountsPerCol.push(colMatches.length);
        matchPositionsPerCol.push(colMatches);
      }

      const consecutiveCols = matchCountsPerCol.length;
      if (consecutiveCols >= 3) {
        hasWin = true;
        let ways = 1;
        for (let i = 0; i < consecutiveCols; i++) {
          ways *= matchCountsPerCol[i];
        }
        totalWays += ways;

        const baseVal = PAYTABLE[sym]?.[consecutiveCols] || 0.1;
        totalPayout += baseVal * ways;

        for (let i = 0; i < consecutiveCols; i++) {
          matchPositionsPerCol[i].forEach(pos => {
            if (!winningCoords.some(coord => coord.c === pos.c && coord.r === pos.r)) {
              winningCoords.push(pos);
            }
          });
        }
      }
    }

    return { hasWin, basePayout: totalPayout, totalWays, winningCoords };
  }

  // Bet steppers
  const handleIncreaseBet = () => {
    superAceAudio.playButtonClick();
    const currIdx = BET_PRESETS.indexOf(betAmount);
    if (currIdx !== -1 && currIdx < BET_PRESETS.length - 1) {
      setBetAmount(BET_PRESETS[currIdx + 1]);
    } else if (betAmount < 5000) {
      setBetAmount(prev => prev + 50);
    }
  };

  const handleDecreaseBet = () => {
    superAceAudio.playButtonClick();
    const currIdx = BET_PRESETS.indexOf(betAmount);
    if (currIdx > 0) {
      setBetAmount(BET_PRESETS[currIdx - 1]);
    } else if (betAmount > 10) {
      setBetAmount(prev => Math.max(10, prev - 10));
    }
  };

  return (
    <div 
      ref={containerRef}
      id="super-ace-cabinet"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white font-sans select-none overflow-hidden"
    >
      {/* ================= 1. AUTHENTIC EMERALD GREEN POKER CASINO FELT ================= */}
      <div className="absolute inset-0 bg-radial from-[#0d3822] via-[#052315] to-[#01120a] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15)_0%,_rgba(0,0,0,0.8)_80%)] pointer-events-none" />

      {/* Subtle playing card suit watermark pattern (♠ ♥ ♦ ♣) */}
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* ================= 2. TOP VIP STATUS & CONTROL BAR ================= */}
      <header className="relative z-20 w-full max-w-4xl px-2 sm:px-4 py-1.5 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-[#0a2617] to-neutral-950 border-b border-yellow-500/30 shadow-md">
        {/* Left: Brand & Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title="Exit Game"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-wider text-yellow-400 font-serif flex items-center gap-1">
              <span>👑</span>
              <span className="hidden sm:inline">JILI</span>
            </span>

            {/* Switch to Super Ace II button */}
            {onSwitchToSuperAce2 && (
              <button
                onClick={() => {
                  superAceAudio.playButtonClick();
                  onSwitchToSuperAce2();
                }}
                className="ml-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-900 to-indigo-950 hover:from-purple-800 hover:to-indigo-900 text-yellow-300 border border-yellow-400/40 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow"
                title="Switch to Super Ace II (14,000X, Golden Bet +50%)"
              >
                <span>👑</span>
                <span>{language === 'bn' ? 'সুপার এস II' : 'Super Ace II'}</span>
              </button>
            )}

            {/* Switch to Super Ace Deluxe button */}
            {onSwitchToDeluxe && (
              <button
                onClick={() => {
                  superAceAudio.playButtonClick();
                  onSwitchToDeluxe();
                }}
                className="ml-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-900 to-rose-950 hover:from-red-800 hover:to-rose-900 text-yellow-300 border border-yellow-400/40 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow"
                title="Switch to Super Ace Deluxe (10,000X, Star Card)"
              >
                <span>⭐</span>
                <span>{language === 'bn' ? 'ডিলাক্স' : 'Deluxe'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Live Real Balance Display */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 rounded-full bg-gradient-to-r from-amber-950/60 via-black to-amber-950/60 border border-yellow-500/50 shadow-inner">
          <span className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">
            {language === 'bn' ? 'ব্যালেন্স' : 'BALANCE'}:
          </span>
          <span className="text-xs sm:text-sm md:text-base font-black font-mono text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            ৳ {balance.toLocaleString()}
          </span>
        </div>

        {/* Right: Sound, Music, Help, Fullscreen Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              superAceAudio.setSoundEnabled(next);
            }}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title="Sound SFX"
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
            title="Paytable & Rules"
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

      {/* ================= 3. MAIN GAME SCREEN & CASINO CABINET ================= */}
      <main className="relative flex-1 w-full max-w-4xl flex flex-col items-center justify-between p-1 sm:p-2.5 overflow-hidden">
        
        {/* Top Feature Bar & Elimination Multiplier Header */}
        <div className="w-full flex flex-col gap-1 sm:gap-1.5 max-w-3xl">
          {/* Free Spins Indicator Banner */}
          {isFreeGame && (
            <div className="w-full py-1 px-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">⭐</span>
                <span className="text-xs sm:text-sm font-black text-black uppercase tracking-wider font-serif">
                  {language === 'bn' ? 'ফ্রি গেম সক্রিয়' : 'FREE GAME ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs font-bold text-amber-950 uppercase">
                  {language === 'bn' ? 'বাকি স্পিন' : 'SPINS LEFT'}:
                </span>
                <span className="text-sm sm:text-base font-black bg-black text-yellow-300 px-2.5 py-0.5 rounded-full border border-yellow-400">
                  {freeSpinsRemaining}
                </span>
              </div>
            </div>
          )}

          {/* Super Ace 3D Brand Logo */}
          <div className="flex items-center justify-between -my-0.5 px-1">
            <div className="flex items-center gap-1.5 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]">
              <span className="text-xl sm:text-2xl filter drop-shadow">👑</span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 uppercase drop-shadow font-serif">
                Super Ace
              </h1>
              <span className="text-xl sm:text-2xl filter drop-shadow text-amber-300">♠</span>
            </div>

            {/* Max Win Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-950/80 via-black to-emerald-950/80 border border-amber-500/40">
              <span className="text-xs">🏆</span>
              <span className="text-[10px] font-black text-yellow-300 tracking-wider font-mono uppercase">
                1,500X MAX WIN
              </span>
            </div>
          </div>

          {/* Elimination Multiplier Ladder (Classic JILI Super Ace: 4 Steps) */}
          {/* Normal: x1, x2, x3, x5 | Free Game: x2, x4, x6, x10 */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 bg-gradient-to-r from-amber-950/70 via-black/80 to-amber-950/70 rounded-xl border border-amber-500/40 shadow-inner">
            {[0, 1, 2, 3].map((step) => {
              const multiplierLabel = isFreeGame 
                ? (step === 0 ? 'x2' : step === 1 ? 'x4' : step === 2 ? 'x6' : 'x10')
                : (step === 0 ? 'x1' : step === 1 ? 'x2' : step === 2 ? 'x3' : 'x5');

              const isActive = comboMultiplierStep === step;

              return (
                <div
                  key={`classic-mult-step-${step}`}
                  className={`relative flex flex-col items-center justify-center py-1 sm:py-1.5 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 text-black shadow-[0_0_12px_rgba(250,204,21,0.8)] scale-105 z-10 border-2 border-white' 
                      : 'bg-black/50 text-neutral-400 border border-amber-900/40 opacity-70'
                  }`}
                >
                  <span className={`font-black text-sm sm:text-base md:text-lg tracking-wider font-mono ${
                    isActive ? 'animate-pulse' : ''
                  }`}>
                    {multiplierLabel}
                  </span>
                  {isActive && (
                    <span className="absolute -top-1 -right-1 text-[8px] sm:text-[9px] bg-yellow-400 text-black font-extrabold px-1 rounded-full shadow">
                      ACTIVE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= 4. THE 5x4 REEL MATRIX ================= */}
        <div className="relative w-full max-w-3xl my-auto py-1 flex items-center justify-center">
          <div className="relative w-full aspect-[5/4] max-h-[58vh] bg-gradient-to-b from-[#082818] via-black to-[#061e12] rounded-2xl p-1.5 sm:p-2 border-2 sm:border-3 border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.4)] flex gap-1 sm:gap-1.5 overflow-hidden">
            
            {/* Dynamic Animated Big Joker Lightning Overlay */}
            <BigJokerLightningOverlay source={bigJokerSource} targets={lightningTargets} />

            {/* 5 Columns / Reels */}
            {[0, 1, 2, 3, 4].map(colIdx => (
              <div 
                key={`classic-col-${colIdx}`}
                className="relative flex-1 h-full bg-gradient-to-b from-black/80 via-neutral-950/90 to-black/80 rounded-xl border border-amber-500/20 overflow-hidden flex flex-col gap-1 p-0.5 sm:p-1"
              >
                {/* 4 Cards in this column */}
                {grid[colIdx].map((card, rowIdx) => {
                  return (
                    <div
                      key={card.id}
                      className={`relative flex-1 w-full rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 transform ${
                        card.isWinning 
                          ? 'scale-105 z-20 ring-2 sm:ring-4 ring-yellow-400 brightness-125 shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse' 
                          : ''
                      } ${
                        card.isEliminating ? 'opacity-0 scale-75 duration-300' : 'opacity-100 scale-100'
                      } ${
                        card.isLightningHit ? 'ring-2 ring-cyan-400 bg-cyan-950/60 animate-ping' : ''
                      }`}
                    >
                      {/* Render Individual Super Ace Card */}
                      <SuperAceCardGraphic
                        type={card.type}
                        isGolden={card.isGolden}
                        isSpinning={isSpinning}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ================= 5. LIVE WIN & STATS BAR ================= */}
        <div className="w-full max-w-3xl flex items-center justify-between px-3 py-1 bg-gradient-to-r from-neutral-950 via-[#0a2617] to-neutral-950 rounded-xl border border-amber-500/30">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs text-neutral-400 font-bold uppercase">
              {language === 'bn' ? '১০২৪ জয়ের উপায়' : '1024 WAYS'}
            </span>
            {winningWaysCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-yellow-300 text-[10px] font-mono font-bold border border-yellow-400/40">
                {winningWaysCount} {language === 'bn' ? 'টি উপায় সক্রিয়' : 'WAYS HIT'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wide">
              {language === 'bn' ? 'মোট জয়' : 'WIN'}:
            </span>
            <span className="text-sm sm:text-lg md:text-xl font-black font-mono text-yellow-300 drop-shadow">
              ৳ {currentWin.toLocaleString()}
            </span>
          </div>
        </div>
      </main>

      {/* ================= 6. CONSOLE CONTROLS (SPIN, BET, AUTO, TURBO) ================= */}
      <footer className="relative z-20 w-full max-w-4xl px-2 sm:px-4 py-2 bg-gradient-to-t from-black via-neutral-950 to-neutral-900 border-t border-amber-500/40 shadow-2xl flex flex-col gap-1.5">
        
        {/* Quick Bet Presets (Mobile & Desktop) */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {BET_PRESETS.map(preset => (
            <button
              key={`classic-bet-${preset}`}
              onClick={() => {
                superAceAudio.playButtonClick();
                setBetAmount(preset);
              }}
              disabled={isSpinning}
              className={`flex-1 min-w-[40px] px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold transition whitespace-nowrap cursor-pointer ${
                betAmount === preset 
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow font-black border border-white' 
                  : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              ৳{preset}
            </button>
          ))}
        </div>

        {/* Primary Controls Row */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Bet Amount Selector */}
          <div className="flex items-center gap-1 bg-black/70 p-1 rounded-xl border border-amber-500/30">
            <button
              onClick={handleDecreaseBet}
              disabled={isSpinning || betAmount <= 10}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-40 flex items-center justify-center text-white cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2 sm:px-3 text-center">
              <span className="block text-[8px] sm:text-[9px] text-neutral-400 font-bold uppercase">
                {language === 'bn' ? 'বাজি' : 'BET'}
              </span>
              <span className="text-xs sm:text-sm md:text-base font-black font-mono text-yellow-300">
                ৳ {betAmount}
              </span>
            </div>

            <button
              onClick={handleIncreaseBet}
              disabled={isSpinning || betAmount >= balance}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-40 flex items-center justify-center text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: BIG SPIN BUTTON */}
          <div className="relative flex-1 flex justify-center">
            <button
              id="super-ace-classic-main-spin-btn"
              onClick={() => handleSpin()}
              disabled={isSpinning}
              className={`group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${
                isSpinning 
                  ? 'bg-neutral-700 opacity-80 pointer-events-none' 
                  : 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 shadow-[0_0_25px_rgba(250,204,21,0.85)] hover:shadow-[0_0_35px_rgba(250,204,21,1)] hover:scale-105'
              }`}
            >
              {/* Outer Golden Metallic Rim */}
              <div className="absolute inset-1 rounded-full border-2 border-white/80" />
              
              {/* Spinning / Action Icon */}
              <div className="flex flex-col items-center justify-center text-black">
                <RotateCcw className={`w-7 h-7 sm:w-8 sm:h-8 ${isSpinning ? 'animate-spin text-neutral-400' : 'text-amber-950 drop-shadow'}`} />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider font-serif">
                  {isSpinning ? 'SPIN' : (language === 'bn' ? 'স্পিন' : 'SPIN')}
                </span>
              </div>
            </button>
          </div>

          {/* Right: TURBO & AUTO SPIN TOGGLES */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Turbo Toggle */}
            <button
              onClick={() => {
                superAceAudio.playButtonClick();
                setIsTurbo(!isTurbo);
              }}
              className={`flex flex-col items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-xl border transition cursor-pointer ${
                isTurbo 
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
              title="Turbo Spin Mode"
            >
              <Zap className={`w-4 h-4 ${isTurbo ? 'fill-yellow-400 text-yellow-400 animate-bounce' : ''}`} />
              <span className="text-[8px] sm:text-[9px] font-black uppercase mt-0.5">
                TURBO
              </span>
            </button>

            {/* Auto Play Button */}
            {autoSpinsRemaining > 0 ? (
              <button
                onClick={() => setAutoSpinsRemaining(0)}
                className="flex flex-col items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-red-600 border border-red-400 text-white animate-pulse cursor-pointer"
                title="Stop Auto Spins"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span className="text-[8px] sm:text-[9px] font-black font-mono mt-0.5">
                  {autoSpinsRemaining}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  superAceAudio.playButtonClick();
                  setShowAutoModal(true);
                }}
                disabled={isSpinning}
                className="flex flex-col items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white disabled:opacity-50 cursor-pointer"
                title="Auto Spin"
              >
                <Play className="w-4 h-4" />
                <span className="text-[8px] sm:text-[9px] font-black uppercase mt-0.5">
                  AUTO
                </span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ================= 7. WIN CELEBRATION OVERLAY ================= */}
      {celebration && (
        <div 
          onClick={() => setCelebration(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn cursor-pointer"
        >
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#082c19] via-black to-[#082c19] border-2 sm:border-4 border-yellow-400 text-center flex flex-col items-center space-y-4 shadow-[0_0_60px_rgba(250,204,21,0.8)]">
            <div className="text-5xl sm:text-6xl animate-bounce">
              {celebration.tier === 'SUPER' ? '👑' : celebration.tier === 'MEGA' ? '🌟' : '💰'}
            </div>

            <h2 className="text-3xl sm:text-5xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 uppercase font-serif drop-shadow">
              {celebration.tier === 'SUPER' 
                ? (language === 'bn' ? 'সুপার উইন!' : 'SUPER WIN!') 
                : celebration.tier === 'MEGA' 
                ? (language === 'bn' ? 'মেগা উইন!' : 'MEGA WIN!') 
                : (language === 'bn' ? 'বিগ উইন!' : 'BIG WIN!')}
            </h2>

            <div className="py-2 px-6 rounded-2xl bg-black/60 border border-yellow-400/60">
              <span className="text-3xl sm:text-5xl font-black font-mono text-yellow-300 drop-shadow">
                ৳ {celebration.amount.toLocaleString()}
              </span>
            </div>

            <p className="text-xs text-neutral-300 animate-pulse">
              {language === 'bn' ? 'চালিয়ে যেতে যেকোনো জায়গায় ট্যাপ করুন' : 'Tap anywhere to continue'}
            </p>
          </div>
        </div>
      )}

      {/* ================= 8. FREE GAME TRIGGER MODAL ================= */}
      {showFreeGameTriggerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-emerald-950 via-black to-emerald-950 border-2 border-yellow-400 p-6 flex flex-col items-center text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-bounce">
              <span className="text-3xl">⭐</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 uppercase font-serif">
                {language === 'bn' ? 'ফ্রি স্পিন বোনাস!' : 'FREE SPINS TRIGGERED!'}
              </h3>
              <p className="text-xs text-neutral-300">
                {language === 'bn'
                  ? '১০টি ফ্রি স্পিন দেওয়া হলো! মাল্টিপ্লায়ার দ্বিগুণ (x2, x4, x6, x10) এবং ১,৫০০ গুণ সর্বোচ্চ জয়!'
                  : '10 Free Spins awarded! Doubled multipliers (x2, x4, x6, x10) & up to 1,500X Max Win!'}
              </p>
            </div>

            <button
              onClick={() => {
                superAceAudio.playButtonClick();
                setShowFreeGameTriggerModal(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-sm uppercase tracking-wider shadow-lg border border-white cursor-pointer hover:scale-105 active:scale-95 transition"
            >
              {language === 'bn' ? 'শুরু করুন' : 'START FREE SPINS'}
            </button>
          </div>
        </div>
      )}

      {/* ================= 9. FREE GAME SUMMARY MODAL ================= */}
      {showFreeGameSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-950 via-black to-amber-950 border-2 border-yellow-400 p-6 flex flex-col items-center text-center space-y-4 shadow-2xl">
            <span className="text-5xl animate-bounce">🏆</span>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-yellow-300 uppercase">
                {language === 'bn' ? 'ফ্রি গেম সম্পন্ন!' : 'FREE GAME COMPLETED!'}
              </h3>
              <p className="text-xs text-neutral-400">
                {language === 'bn' ? 'আপনার অর্জিত মোট পুরস্কার:' : 'Total Free Spins Winnings:'}
              </p>
            </div>

            <div className="py-3 px-6 rounded-2xl bg-black/80 border border-yellow-400">
              <span className="text-3xl font-black font-mono text-yellow-300">
                ৳ {freeGameTotalWin.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                superAceAudio.playButtonClick();
                setShowFreeGameSummaryModal(false);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-black font-black text-sm uppercase tracking-wider cursor-pointer"
            >
              {language === 'bn' ? 'সংগ্রহ করুন' : 'COLLECT'}
            </button>
          </div>
        </div>
      )}

      {/* ================= 10. PAYTABLE & RULES MODAL ================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-[#082617] border-2 border-amber-500/60 p-5 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <h3 className="text-lg font-black text-amber-300 uppercase tracking-wide">
                  {language === 'bn' ? 'সুপার এস পেটেবিল ও নিয়ম' : 'SUPER ACE PAYTABLE & RULES'}
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-full bg-black/50 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs text-neutral-200 pr-1">
              {/* 1024 Ways */}
              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-1">
                <h5 className="font-black text-amber-400 text-sm flex items-center justify-between">
                  <span>{language === 'bn' ? '১০২৪ জয়ের উপায় (1024 Ways)' : '1024 Ways to Win'}</span>
                  <span className="text-[10px] bg-amber-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-mono">1,500X MAX WIN</span>
                </h5>
                <p className="text-neutral-300 leading-relaxed">
                  {language === 'bn'
                    ? 'সব জয় বামদিকের রিল থেকে শুরু করে পাশাপাশি রিলে একই চিহ্নের উপস্থিতিতে প্রদান করা হয়।'
                    : 'All winning symbols must appear consecutively from leftmost reel to right reel.'}
                </p>
              </div>

              {/* Golden Card Rule */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-yellow-500/40 space-y-1">
                <h5 className="font-black text-yellow-300 text-sm flex items-center gap-1.5">
                  <span>🃏</span>
                  <span>{language === 'bn' ? 'গোল্ডেন কার্ড ও জোকার ফিচার' : 'Golden Card & Joker Wilds'}</span>
                </h5>
                <p className="text-neutral-300 leading-relaxed">
                  {language === 'bn'
                    ? 'গোল্ডেন কার্ড শুধুমাত্র রিল ২, ৩ এবং ৪-এ উপস্থিত হয়। জয়ী হলে এটি লিটল জোকার বা বিগ জোকার-এ রূপান্তরিত হয়।'
                    : 'Golden Cards only appear on reels 2, 3, and 4. When eliminated, they flip into Little Joker or Big Joker.'}
                </p>
                <p className="text-neutral-300 leading-relaxed">
                  {language === 'bn'
                    ? 'বিগ জোকার সক্রিয় হলে বিদ্যুৎ চমকিয়ে অন্যান্য কার্ডকে লিটল জোকারে রূপান্তরিত করে!'
                    : 'Big Joker unleashes lightning to transform other symbols into Little Jokers!'}
                </p>
              </div>

              {/* Multipliers (4-Step Classic) */}
              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-1">
                <h5 className="font-black text-amber-400 text-sm">
                  {language === 'bn' ? 'এলিমিনেশন মাল্টিপ্লায়ার ল্যাডার' : 'Elimination Multiplier Ladder'}
                </h5>
                <p className="text-neutral-300">
                  {language === 'bn'
                    ? '• সাধারণ খেলা: ১ম জয় = x1, ২য় এলিমিনেশন = x2, ৩য় এলিমিনেশন = x3, ৪র্থ+ এলিমিনেশন = x5!'
                    : '• Base Game: 1st win = x1, 2nd tumble = x2, 3rd tumble = x3, 4th+ tumble = x5!'}
                </p>
                <p className="text-neutral-300">
                  {language === 'bn'
                    ? '• ফ্রি গেম (ফ্রি স্পিন): মাল্টিপ্লায়ার দ্বিগুণ হয়: x2, x4, x6, x10!'
                    : '• Free Game: Multipliers are doubled: x2, x4, x6, x10!'}
                </p>
              </div>

              {/* Free Game Scatter Rule */}
              <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-1">
                <h5 className="font-black text-amber-400 text-sm">
                  {language === 'bn' ? 'ফ্রি গেম ($ কয়েন স্ক্যাটার)' : 'Free Spins ($ Coin Scatter)'}
                </h5>
                <p className="text-neutral-300">
                  {language === 'bn'
                    ? '৩টি বা তার বেশি স্ক্যাটার ($ কয়েন) সংগ্রহ করলে ১০টি ফ্রি স্পিন পাওয়া যায়। ফ্রি গেম চলাকালীন ৩টি স্ক্যাটারে অতিরিক্ত ৫টি স্পিন যোগ হবে।'
                    : 'Collect 3 or more Scatters ($ Coin) anywhere to trigger 10 Free Spins! During Free Game, 3 Scatters award +5 additional spins.'}
                </p>
              </div>

              {/* Symbols Payout Table */}
              <div className="space-y-1.5">
                <h5 className="font-black text-amber-400 text-sm">
                  {language === 'bn' ? 'চিহ্নসমূহের পে-টেবিল' : 'Symbol Multipliers (x Total Bet)'}
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-yellow-300">Ace (A):</span> 5=2.5x, 4=1.5x, 3=0.5x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-yellow-300">King (K):</span> 5=2.0x, 4=1.0x, 3=0.4x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-yellow-300">Queen (Q):</span> 5=1.5x, 4=0.8x, 3=0.3x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-yellow-300">Jack (J):</span> 5=1.0x, 4=0.5x, 3=0.2x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-neutral-300">Spade (♠):</span> 5=0.75x, 4=0.35x, 3=0.15x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-neutral-300">Heart (♥):</span> 5=0.75x, 4=0.35x, 3=0.15x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-neutral-300">Diamond (♦):</span> 5=0.5x, 4=0.25x, 3=0.1x
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-neutral-800">
                    <span className="font-bold text-neutral-300">Club (♣):</span> 5=0.5x, 4=0.25x, 3=0.1x
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 11. AUTO SPINS SETUP MODAL ================= */}
      {showAutoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-xs rounded-3xl bg-[#082617] border-2 border-yellow-500/60 p-5 flex flex-col items-center space-y-4 shadow-2xl">
            <h4 className="text-base font-black text-amber-300 uppercase">
              {language === 'bn' ? 'স্বয়ংক্রিয় স্পিন নির্বাচন' : 'SELECT AUTO SPINS'}
            </h4>

            <div className="grid grid-cols-2 gap-2 w-full">
              {AUTO_SPIN_OPTIONS.map(opt => (
                <button
                  key={`classic-auto-opt-${opt}`}
                  onClick={() => {
                    superAceAudio.playButtonClick();
                    setAutoSpinsRemaining(opt);
                    setShowAutoModal(false);
                    handleSpin();
                  }}
                  className="py-2.5 rounded-xl bg-neutral-900 hover:bg-amber-600 hover:text-black border border-amber-500/30 text-yellow-300 font-mono font-bold text-sm transition cursor-pointer"
                >
                  {opt} {language === 'bn' ? 'স্পিন' : 'Spins'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAutoModal(false)}
              className="w-full py-2 rounded-xl bg-neutral-800 text-neutral-400 font-bold text-xs uppercase cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'CANCEL'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
