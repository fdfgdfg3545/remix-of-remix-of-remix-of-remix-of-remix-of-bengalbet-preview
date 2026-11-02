// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  Zap,
  RotateCw,
  Sparkles,
  Flame,
  Plus,
  Minus,
  X,
  Tv,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { OlympusCell, OlympusSymbolType, OLYMPUS_PAYTABLE } from './olympusTypes';
import { olympusAudio } from './olympusAudio';
import olympusIcon from '../../assets/images/gates_olympus_icon_1789330801506.jpg';
import { gameEngine } from '../../services/gameEngine';

interface Props {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

const COLS = 6;
const ROWS = 5;
const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];
const MULTIPLIER_VALUES = [2, 3, 5, 8, 10, 15, 25, 50, 100, 250, 500];

const REGULAR_SYMBOLS: OlympusSymbolType[] = [
  'blue_gem', 'blue_gem', 'blue_gem',
  'green_gem', 'green_gem', 'green_gem',
  'yellow_gem', 'yellow_gem',
  'purple_gem', 'purple_gem',
  'red_gem', 'red_gem',
  'chalice',
  'ring',
  'hourglass',
  'crown'
];

function getRandomCell(isAnteBet = false, inFreeSpins = false): OlympusCell {
  // Scatter chance
  const scatterChance = isAnteBet ? 0.065 : 0.04;
  if (Math.random() < scatterChance) {
    return {
      id: Math.random().toString(36).substring(2, 8),
      type: 'scatter'
    };
  }

  // Multiplier Orb chance (dropped by Zeus)
  const multChance = inFreeSpins ? 0.08 : 0.035;
  if (Math.random() < multChance) {
    const weights = [40, 25, 15, 8, 5, 3, 2, 1, 0.5, 0.3, 0.2];
    const rand = Math.random() * 100;
    let sum = 0;
    let chosenVal = 2;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (rand <= sum) {
        chosenVal = MULTIPLIER_VALUES[i];
        break;
      }
    }
    return {
      id: Math.random().toString(36).substring(2, 8),
      type: 'multiplier',
      multiplierValue: chosenVal
    };
  }

  const type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
  return {
    id: Math.random().toString(36).substring(2, 8),
    type
  };
}

function generateInitialGrid(isAnte = false, inFree = false): OlympusCell[][] {
  const grid: OlympusCell[][] = [];
  for (let c = 0; c < COLS; c++) {
    const col: OlympusCell[] = [];
    for (let r = 0; r < ROWS; r++) {
      col.push(getRandomCell(isAnte, inFree));
    }
    grid.push(col);
  }
  return grid;
}

export const GatesOfOlympusGame: React.FC<Props> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const [balance, setBalance] = useState<number>(user.balance);
  const [betIndex, setBetIndex] = useState<number>(2); // 50 BDT
  const [isAnteBet, setIsAnteBet] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [grid, setGrid] = useState<OlympusCell[][]>(() => generateInitialGrid());
  const [totalMultiplier, setTotalMultiplier] = useState<number>(0);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [zeusLightning, setZeusLightning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'bn' ? 'গেটস অফ অলিম্পাসে স্বাগতম! ৮+ যেকোনো স্থানে মেলে।' : 'Welcome to Gates of Olympus! 8+ pays anywhere.'
  );
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showBigWin, setShowBigWin] = useState<boolean>(false);

  const baseBet = BET_OPTIONS[betIndex];
  const actualBet = isAnteBet ? Math.round(baseBet * 1.25) : baseBet;

  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    olympusAudio.enabled = next;
  };

  const changeBet = (delta: number) => {
    if (isSpinning) return;
    const next = Math.max(0, Math.min(BET_OPTIONS.length - 1, betIndex + delta));
    setBetIndex(next);
  };

  // Main spin handler
  const handleSpin = async (isBuyFeature = false) => {
    if (isSpinning) return;

    let cost = 0;
    if (isBuyFeature) {
      cost = baseBet * 100;
      if (balance < cost) {
        setStatusMessage(language === 'bn' ? 'ফিচার কেনার জন্য পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient Balance for Feature Buy!');
        return;
      }
      updateBalance(balance - cost);
    } else if (!isFreeSpinsActive) {
      cost = actualBet;
      if (balance < cost) {
        setStatusMessage(language === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করুন।' : 'Insufficient Balance! Please deposit.');
        setIsAutoSpin(false);
        return;
      }
      updateBalance(balance - cost);
    }

    setIsSpinning(true);
    setRoundWin(0);
    olympusAudio.playTumble();

    if (isBuyFeature) {
      setIsFreeSpinsActive(true);
      setFreeSpinsLeft(15);
      setTotalMultiplier(0);
      setStatusMessage(language === 'bn' ? '⚡ ১৫টি জিউস ফ্রি স্পিন সক্রিয়!' : '⚡ 15 ZEUS FREE SPINS ACTIVATED!');
    }

    let currentGrid = generateInitialGrid(isAnteBet, isFreeSpinsActive || isBuyFeature);
    setGrid(currentGrid);

    // Check Scatters (Zeus)
    let scatterCount = 0;
    currentGrid.forEach(col => col.forEach(c => { if (c.type === 'scatter') scatterCount++; }));

    if (scatterCount >= 4) {
      olympusAudio.playZeusScatter();
      setZeusLightning(true);
      setTimeout(() => setZeusLightning(false), 900);

      const scatterMultiplier = scatterCount === 4 ? 3 : scatterCount === 5 ? 5 : 100;
      const scatterWin = actualBet * scatterMultiplier;
      updateBalance(balance + scatterWin);

      if (!isFreeSpinsActive && !isBuyFeature) {
        setIsFreeSpinsActive(true);
        setFreeSpinsLeft(15);
        setTotalMultiplier(0);
        setStatusMessage(
          language === 'bn'
            ? `⚡ জিউস স্ক্যাটার (${scatterCount})! ১৫টি ফ্রি স্পিন লাভ!`
            : `⚡ ZEUS SCATTERS (${scatterCount})! 15 Free Spins Won!`
        );
      } else if (isFreeSpinsActive) {
        setFreeSpinsLeft(prev => prev + 5);
      }
    }

    // Tumble loop
    let accumulatedRoundWin = 0;
    let hasWins = true;
    let tumbleStep = 0;
    let spinMultiplierSum = 0;

    while (hasWins) {
      tumbleStep++;

      // Count symbol occurrences anywhere on the 6x5 grid (Scatter Pays 8+)
      const counts: Record<string, { count: number; cells: { col: number; row: number; id: string }[] }> = {};
      currentGrid.forEach((col, cIdx) => {
        col.forEach((cell, rIdx) => {
          if (cell.type !== 'scatter' && cell.type !== 'multiplier') {
            if (!counts[cell.type]) {
              counts[cell.type] = { count: 0, cells: [] };
            }
            counts[cell.type].count++;
            counts[cell.type].cells.push({ col: cIdx, row: rIdx, id: cell.id });
          }
        });
      });

      // Find winning groups (>= 8)
      let stepBaseWin = 0;
      const winningIds = new Set<string>();

      for (const [symType, data] of Object.entries(counts)) {
        if (data.count >= 8) {
          const payDef = OLYMPUS_PAYTABLE[symType as OlympusSymbolType];
          let tierIndex = 0;
          if (data.count >= 12) tierIndex = 2;
          else if (data.count >= 10) tierIndex = 1;
          else tierIndex = 0;

          const payoutMult = payDef.payouts[tierIndex];
          const winAmount = Math.round(baseBet * payoutMult);
          stepBaseWin += winAmount;

          data.cells.forEach(c => winningIds.add(c.id));
        }
      }

      // Check if Zeus multiplier orbs landed on this screen
      let currentOrbsSum = 0;
      currentGrid.forEach(col => {
        col.forEach(c => {
          if (c.type === 'multiplier' && c.multiplierValue) {
            currentOrbsSum += c.multiplierValue;
          }
        });
      });

      if (currentOrbsSum > 0) {
        spinMultiplierSum = Math.max(spinMultiplierSum, currentOrbsSum);
        olympusAudio.playThunder();
        setZeusLightning(true);
        setTimeout(() => setZeusLightning(false), 700);
      }

      if (stepBaseWin > 0) {
        accumulatedRoundWin += stepBaseWin;
        olympusAudio.playWinChime(totalMultiplier || 1);

        // Highlight winning cells
        const highlighted = currentGrid.map(col =>
          col.map(cell => (winningIds.has(cell.id) ? { ...cell, isWinning: true } : cell))
        );
        setGrid(highlighted);
        await new Promise(r => setTimeout(r, isTurbo ? 250 : 450));

        // Tumble: Remove winning cells and drop new ones
        const collapsed: OlympusCell[][] = [];
        for (let c = 0; c < COLS; c++) {
          const surviving = highlighted[c].filter(cell => !cell.isWinning);
          const needed = ROWS - surviving.length;
          const fresh: OlympusCell[] = [];
          for (let i = 0; i < needed; i++) {
            fresh.push(getRandomCell(isAnteBet, isFreeSpinsActive || isBuyFeature));
          }
          collapsed.push([...fresh, ...surviving]);
        }
        currentGrid = collapsed;
        setGrid(currentGrid);
        olympusAudio.playTumble();

        await new Promise(r => setTimeout(r, isTurbo ? 200 : 350));
      } else {
        hasWins = false;
      }
    }

    // Apply multiplier to the total round win!
    let finalRoundMultiplier = 1;
    if (isFreeSpinsActive || isBuyFeature) {
      if (spinMultiplierSum > 0) {
        const nextTotal = totalMultiplier + spinMultiplierSum;
        setTotalMultiplier(nextTotal);
        finalRoundMultiplier = nextTotal;
      } else {
        finalRoundMultiplier = Math.max(1, totalMultiplier);
      }
    } else {
      finalRoundMultiplier = Math.max(1, spinMultiplierSum);
    }

    if (accumulatedRoundWin > 0) {
      const finalWin = accumulatedRoundWin * finalRoundMultiplier;
      setLastWin(finalWin);
      setRoundWin(finalWin);
      updateBalance(balance + finalWin);
      gameEngine.recordRound(cost, finalWin, {
        gameId: 'game-gates-olympus',
        gameName: 'Gates of Olympus',
        category: 'slot',
        vendor: 'Pragmatic Play'
      });

      if (finalWin >= actualBet * 15) {
        setShowBigWin(true);
        confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
        setTimeout(() => setShowBigWin(false), 2800);
      }

      setStatusMessage(
        language === 'bn'
          ? `⚡ জিউসের জয়: ৳ ${finalWin.toLocaleString()}! (${finalRoundMultiplier}X মাল্টিপ্লায়ার)`
          : `⚡ ZEUS OLYMPUS WIN: ৳ ${finalWin.toLocaleString()}! (${finalRoundMultiplier}X Multiplier)`
      );
    } else {
      if (!isFreeSpinsActive) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-gates-olympus',
          gameName: 'Gates of Olympus',
          category: 'slot',
          vendor: 'Pragmatic Play'
        });
      }
      setStatusMessage(language === 'bn' ? 'স্পিন করুন ও জিউসের আশীর্বাদ নিন!' : 'Spin for the blessing of Zeus!');
    }

    // Free Spins counter decrement
    if (isFreeSpinsActive && freeSpinsLeft > 0) {
      setFreeSpinsLeft(prev => {
        const next = prev - 1;
        if (next === 0) {
          setIsFreeSpinsActive(false);
          setStatusMessage(language === 'bn' ? 'ফ্রি স্পিন সমাপ্ত!' : 'Olympus Free Spins Completed!');
        }
        return next;
      });
    }

    setIsSpinning(false);
  };

  // Auto-spin timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpin && !isSpinning) {
      if (freeSpinsLeft > 0) {
        timer = setTimeout(() => handleSpin(false), isTurbo ? 400 : 800);
      } else if (autoSpinsLeft > 0) {
        timer = setTimeout(() => {
          setAutoSpinsLeft(prev => prev - 1);
          handleSpin(false);
        }, isTurbo ? 500 : 1000);
      } else {
        setIsAutoSpin(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, autoSpinsLeft, freeSpinsLeft]);

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#130d24] via-[#21153b] to-[#0d071a] flex flex-col overflow-hidden select-none font-sans text-gray-100">
      
      {/* 1. HEADER BAR */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 bg-[#1a1033]/95 border-b border-purple-500/40 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all active:scale-95"
            title="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লবি' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={olympusIcon}
              alt="Gates of Olympus"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-amber-400/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-game text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-purple-300">
                  {language === 'bn' ? 'গেটস অফ অলিম্পাস' : 'Gates of Olympus'}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  Pragmatic
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live BDT Balance */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0b0517] border border-purple-400/40 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs text-purple-300 font-bold uppercase">BDT</span>
            <span className="text-xs sm:text-sm font-black font-game text-yellow-300 tracking-wider">
              ৳ {balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowVideo(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-500/30 text-xs font-bold transition-all"
            title="YouTube Video Guide"
          >
            <Tv className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPaytable(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs font-bold transition-all ${
              isSoundOn
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. GAME STAGE */}
      <div className={`relative flex-1 flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden transition-all duration-300 ${
        zeusLightning ? 'bg-indigo-900/60' : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/50 via-[#180e2b] to-[#0a0514]'
      }`}>
        
        {/* Top Status & Zeus Multiplier Banner */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-2 px-2.5 py-1.5 bg-black/60 rounded-xl border border-purple-500/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 truncate">
            {isFreeSpinsActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs animate-pulse shadow-md">
                ⚡ FREE SPINS: {freeSpinsLeft}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 font-bold text-[11px] border border-purple-400/40">
                SCATTER PAYS (8+)
              </span>
            )}
            <span className="text-xs text-yellow-200 font-bold truncate">{statusMessage}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs shadow-md shrink-0">
            <Flame className="w-3.5 h-3.5" />
            <span>TOTAL: {Math.max(1, totalMultiplier)}X</span>
          </div>
        </div>

        {/* 6x5 GRID CABINET */}
        <div className="relative w-full max-w-2xl flex-1 max-h-[58vh] sm:max-h-[62vh] my-1 p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#251545] via-[#1a0e33] to-[#100721] border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(168,85,247,0.3)] flex flex-col justify-between">
          
          <div className="grid grid-cols-6 gap-1 sm:gap-1.5 flex-1 w-full">
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1 sm:gap-1.5 h-full justify-between">
                {col.map((cell) => {
                  const payDef = OLYMPUS_PAYTABLE[cell.type];
                  return (
                    <div
                      key={cell.id}
                      className={`relative flex-1 rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-200 shadow-md ${
                        cell.isWinning
                          ? 'ring-2 ring-yellow-300 scale-105 z-10 bg-yellow-400/40 animate-pulse'
                          : cell.type === 'multiplier'
                          ? 'border-2 border-pink-400 bg-gradient-to-b from-fuchsia-600 to-purple-900 shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-bounce'
                          : cell.type === 'scatter'
                          ? 'border-2 border-amber-300 bg-gradient-to-b from-amber-500 to-yellow-700 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                          : `bg-gradient-to-b ${payDef.bgGrad} border border-white/10`
                      }`}
                    >
                      <span className="text-xl sm:text-2xl filter drop-shadow-md select-none">
                        {payDef.emoji}
                      </span>
                      {cell.type === 'multiplier' && cell.multiplierValue && (
                        <span className="text-[10px] font-black text-yellow-200 bg-black/70 px-1 rounded-sm mt-0.5">
                          {cell.multiplierValue}X
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win Ticker */}
          {roundWin > 0 && (
            <div className="absolute inset-x-4 bottom-2 py-1 px-3 bg-black/85 rounded-xl border border-yellow-400/80 flex items-center justify-between text-xs font-bold text-yellow-300 shadow-2xl animate-in fade-in">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{language === 'bn' ? 'অলিম্পাস টাম্বল জয়!' : 'OLYMPUS TUMBLE WIN!'}</span>
              </span>
              <span className="font-black text-emerald-400">+৳ {roundWin.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 3. CONTROL PANEL */}
        <div className="w-full max-w-2xl bg-[#1a1033]/95 border border-purple-500/40 rounded-2xl p-2 sm:p-3 shadow-xl flex flex-col gap-2 shrink-0">
          
          {/* Ante Bet & Feature Buy */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Ante Bet Toggle */}
            <button
              onClick={() => !isSpinning && setIsAnteBet(!isAnteBet)}
              disabled={isSpinning || isFreeSpinsActive}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all ${
                isAnteBet
                  ? 'bg-emerald-500 text-black border-emerald-300 font-black shadow-md'
                  : 'bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-900/50'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isAnteBet ? 'bg-black text-emerald-400' : 'border-purple-400'}`}>
                {isAnteBet && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-[11px] font-bold">
                {language === 'bn' ? 'অ্যান্টে বাজি (+২৫% ডাবল চান্স)' : 'ANTE BET (+25% 2X Chance)'}
              </span>
            </button>

            {/* Buy Free Spins Button */}
            <button
              onClick={() => !isSpinning && handleSpin(true)}
              disabled={isSpinning || isFreeSpinsActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 border border-yellow-300 text-black font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{language === 'bn' ? `ফ্রি স্পিন কিনুন (৳ ${(baseBet * 100).toLocaleString()})` : `BUY SPINS (৳ ${(baseBet * 100).toLocaleString()})`}</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Bet Step */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-purple-500/30">
              <button
                onClick={() => changeBet(-1)}
                disabled={isSpinning || betIndex === 0}
                className="w-8 h-8 rounded-lg bg-purple-950/60 hover:bg-purple-800 text-purple-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-2 text-center min-w-[75px]">
                <div className="text-[9px] text-purple-300 font-bold uppercase">{language === 'bn' ? 'বাজি' : 'Bet'}</div>
                <div className="text-sm font-black text-yellow-300">৳ {actualBet}</div>
              </div>
              <button
                onClick={() => changeBet(1)}
                disabled={isSpinning || betIndex === BET_OPTIONS.length - 1}
                className="w-8 h-8 rounded-lg bg-purple-950/60 hover:bg-purple-800 text-purple-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick chips */}
            <div className="hidden sm:flex items-center gap-1">
              {[20, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    const idx = BET_OPTIONS.indexOf(amt);
                    if (idx !== -1 && !isSpinning) setBetIndex(idx);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                    BET_OPTIONS[betIndex] === amt
                      ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                      : 'bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-900/50'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            {/* Turbo */}
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                isTurbo
                  ? 'bg-amber-500 text-black border-yellow-200 font-black shadow-md'
                  : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Turbo</span>
            </button>

            {/* Auto */}
            <button
              onClick={() => {
                if (isAutoSpin) {
                  setIsAutoSpin(false);
                  setAutoSpinsLeft(0);
                } else {
                  setIsAutoSpin(true);
                  setAutoSpinsLeft(20);
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                isAutoSpin
                  ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                  : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
              <span>{isAutoSpin ? `${autoSpinsLeft}` : 'Auto'}</span>
            </button>

            {/* Spin Button */}
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-yellow-200 active:scale-95 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>{isSpinning ? '...' : (language === 'bn' ? 'স্পিন' : 'SPIN')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. BIG WIN MODAL */}
      {showBigWin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs animate-in zoom-in-95">
          <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-yellow-500 via-purple-700 to-indigo-950 border-4 border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.9)] max-w-sm">
            <h2 className="text-3xl font-black text-yellow-200 animate-bounce tracking-widest drop-shadow-md">
              ⚡ ZEUS MEGA WIN! ⚡
            </h2>
            <div className="my-4 text-4xl sm:text-5xl font-black text-white font-game drop-shadow-lg">
              ৳ {lastWin.toLocaleString()}
            </div>
            <p className="text-sm font-bold text-yellow-200">
              {language === 'bn' ? 'অলিম্পাসের দেবতাদের আশীর্বাদ!' : 'Blessed by the Gods of Olympus!'}
            </p>
          </div>
        </div>
      )}

      {/* 5. PAYTABLE MODAL */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-lg bg-[#190f33] border-2 border-purple-400 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/40">
              <div className="flex items-center gap-2">
                <img
                  src={olympusIcon}
                  alt="Gates of Olympus"
                  className="w-7 h-7 rounded-md object-cover"
                />
                <h3 className="font-game text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'গেটস অফ অলিম্পাস পে-টেবিল' : 'Gates of Olympus Paytable'}
                </h3>
              </div>
              <button
                onClick={() => setShowPaytable(false)}
                className="p-1 rounded-lg bg-purple-900/60 text-purple-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">
                  {language === 'bn' ? '⚡ স্ক্যাটার পে (Scatter Pays Everywhere)' : '⚡ Scatter Pays Everywhere'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'কোনো পে-লাইনের প্রয়োজন নেই! গ্রিডের যেকোনো স্থানে ৮ বা ততোধিক একই প্রতীক থাকলে বিজয় হয়।'
                    : 'No paylines needed! 8 or more matching symbols anywhere on the screen award a win.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">
                  {language === 'bn' ? '☄️ জিউস মাল্টিপ্লায়ার অর্ব (২X - ৫০০X)' : '☄️ Zeus Multiplier Orbs (2X - 500X)'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'জিউস বজ্রপাতের মাধ্যমে স্ক্রিনে ২X থেকে ৫০০X পর্যন্ত মাল্টিপ্লায়ার অর্ব বর্ষণ করতে পারেন। স্পিন শেষে সকল অর্বের মান যোগ হয়ে মোট জয়ে গুণ হয়!'
                    : 'Zeus can summon multiplier orbs from 2X up to 500X. At the end of all tumbles, all multipliers are summed and applied to the total spin win!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(OLYMPUS_PAYTABLE).filter(s => s.type !== 'multiplier').map(s => (
                  <div key={s.type} className="p-2 rounded-lg bg-black/40 border border-purple-500/20 flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold text-purple-200">{language === 'bn' ? s.nameBn : s.name}</div>
                      <div className="text-[10px] text-gray-400">
                        8-9: {s.payouts[0]}x | 10-11: {s.payouts[1]}x | 12+: {s.payouts[2]}x
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. YOUTUBE VIDEO MODAL */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-2xl bg-[#140b2b] border-2 border-purple-400 rounded-2xl p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/40 mb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-500" />
                <h3 className="font-game text-base sm:text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'গেটস অফ অলিম্পাস গেমপ্লে ওয়াকথ্রু' : 'Gates of Olympus Gameplay Walkthrough'}
                </h3>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="p-1 rounded-lg bg-purple-900/60 text-purple-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-500/30">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/videoseries?list=PL_fake_olympus"
                title="Gates of Olympus Gameplay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-xs text-purple-200/80 text-center">
              {language === 'bn'
                ? 'ভিডিওতে দেখুন কীভাবে জিউসের ৫০০X মাল্টিপ্লায়ার এবং ফ্রি স্পিন টাম্বল অবিশ্বাস্য জয় তৈরি করে!'
                : 'Watch how Zeus 500X multipliers and Free Spins tumbles create massive jackpot hits!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
