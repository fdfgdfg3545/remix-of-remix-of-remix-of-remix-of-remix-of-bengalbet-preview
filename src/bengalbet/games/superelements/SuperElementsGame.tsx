// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw, 
  Zap, 
  ArrowLeft, 
  Flame, 
  Atom, 
  Coins, 
  Minus, 
  Plus,
  Play,
  Pause,
  Sparkles,
  Radio
} from 'lucide-react';
import { UserAccount } from '../../types';
import { 
  ElementCell, 
  WaysWin, 
  BASE_MULTIPLIER_STEPS, 
  FREE_SPINS_MULTIPLIER_STEPS 
} from './superElementsTypes';
import { 
  createInitialGrid, 
  generateSpinGrid, 
  evaluateWaysWins, 
  cascadeGrid, 
  countScatters 
} from './superElementsEngine';
import { superElementsAudio } from './superElementsAudio';
import { SuperElementsSymbolView } from './SuperElementsSymbolView';
import { SuperElementsPaytableModal } from './SuperElementsPaytableModal';
import { SuperElementsWinOverlay } from './SuperElementsWinOverlay';
import { gameEngine } from '../../services/gameEngine';

interface SuperElementsGameProps {
  language: 'en' | 'bn';
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const SuperElementsGame: React.FC<SuperElementsGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const isBn = language === 'bn';

  // Game state
  const [balance, setBalance] = useState<number>(user.balance || 2500);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [grid, setGrid] = useState<ElementCell[][]>(createInitialGrid);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [cascadeStep, setCascadeStep] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number>(0);

  // Free Spins Mode
  const [isFreeSpins, setIsFreeSpins] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState<number>(0);

  // Settings & Overlays
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number | null>(null);

  // Buy Free Spins Modal state
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);

  // Refs for tracking async state
  const isSpinningRef = useRef(false);
  isSpinningRef.current = isSpinning;
  const isFreeSpinsRef = useRef(false);
  isFreeSpinsRef.current = isFreeSpins;
  const freeSpinsLeftRef = useRef(0);
  freeSpinsLeftRef.current = freeSpinsLeft;
  const autoSpinRef = useRef(0);
  autoSpinRef.current = autoSpinCount;
  const betAmountRef = useRef(betAmount);
  betAmountRef.current = betAmount;
  const balanceRef = useRef(balance);
  balanceRef.current = balance;

  const currentMultiplierSteps = isFreeSpins ? FREE_SPINS_MULTIPLIER_STEPS : BASE_MULTIPLIER_STEPS;
  const currentMultiplier = currentMultiplierSteps[Math.min(cascadeStep, currentMultiplierSteps.length - 1)];

  // Audio mute toggle
  const handleToggleMute = () => {
    const muted = superElementsAudio.toggleMute();
    setIsMuted(muted);
  };

  // Quick Bet presets
  const betPresets = [10, 20, 50, 100, 200, 500];

  // Helper wait
  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Core spin loop with cascading elimination
  const executeSpin = useCallback(async (forcedFreeSpins = false) => {
    if (isSpinningRef.current) return;

    const currentBet = betAmountRef.current;
    const currentBal = balanceRef.current;
    const inFreeSpins = isFreeSpinsRef.current || forcedFreeSpins;

    // Deduct bet if not free spin
    if (!inFreeSpins) {
      if (currentBal < currentBet) {
        alert(isBn ? 'অপর্যাপ্ত ব্যালেন্স! অনুগ্রহ করে ডিপোজিট করুন।' : 'Insufficient balance! Please deposit.');
        setAutoSpinCount(0);
        return;
      }
      const newBal = currentBal - currentBet;
      setBalance(newBal);
      onUpdateBalance(newBal);
    }

    setIsSpinning(true);
    setLastWin(0);
    setCascadeStep(0);

    superElementsAudio.playSpin();

    // 1. Initial Reel spin animation
    const delayBeforeStop = isTurbo ? 180 : 350;
    await wait(delayBeforeStop);

    // Generate fresh spin grid
    let currentGrid = generateSpinGrid(inFreeSpins);
    setGrid(currentGrid);

    for (let c = 0; c < 6; c++) {
      superElementsAudio.playReelStop(c);
      await wait(isTurbo ? 35 : 70);
    }

    // Check for Scatters in fresh grid
    const scatterCount = countScatters(currentGrid);
    if (scatterCount > 0) {
      superElementsAudio.playScatterDrop();
    }

    // 2. Cascading elimination cycle
    let step = 0;
    let roundTotalWin = 0;
    let hasWinningCascade = true;

    while (hasWinningCascade) {
      const { wins, totalPayout } = evaluateWaysWins(currentGrid, currentBet);

      if (wins.length > 0 && totalPayout > 0) {
        // Multiplier at this cascade step
        const ladder = inFreeSpins ? FREE_SPINS_MULTIPLIER_STEPS : BASE_MULTIPLIER_STEPS;
        const stepMultiplier = ladder[Math.min(step, ladder.length - 1)];
        const stepWin = totalPayout * stepMultiplier;
        roundTotalWin += stepWin;

        setCascadeStep(step);
        superElementsAudio.playCascadeExplosion(step);

        // Highlight winning cells on grid
        const winningCoords: { col: number; row: number }[] = [];
        wins.forEach(w => winningCoords.push(...w.coordinates));

        const highlightedGrid = currentGrid.map((col, cIdx) =>
          col.map((cell, rIdx) => {
            const isMatched = winningCoords.some(pt => pt.col === cIdx && pt.row === rIdx);
            return isMatched ? { ...cell, winHighlight: true } : cell;
          })
        );
        setGrid(highlightedGrid);
        setLastWin(roundTotalWin);

        await wait(isTurbo ? 250 : 500);

        // Check if any winning cell was golden (will transform to wild)
        const hasGoldenInWin = winningCoords.some(pt => currentGrid[pt.col][pt.row].isGolden);
        if (hasGoldenInWin) {
          superElementsAudio.playGoldenTransform();
        }

        // Animate elimination
        const eliminatingGrid = currentGrid.map((col, cIdx) =>
          col.map((cell, rIdx) => {
            const isMatched = winningCoords.some(pt => pt.col === cIdx && pt.row === rIdx);
            return isMatched ? { ...cell, isEliminating: true } : cell;
          })
        );
        setGrid(eliminatingGrid);

        await wait(isTurbo ? 180 : 350);

        // Cascade down
        currentGrid = cascadeGrid(currentGrid, winningCoords, inFreeSpins);
        setGrid(currentGrid);

        step++;
        await wait(isTurbo ? 150 : 300);
      } else {
        hasWinningCascade = false;
      }
    }

    // Payout round winnings
    if (roundTotalWin > 0) {
      setBalance(prev => {
        const nextBal = prev + roundTotalWin;
        onUpdateBalance(nextBal);
        return nextBal;
      });

      const cost = inFreeSpins ? 0 : currentBet;
      gameEngine.recordRound(cost, roundTotalWin, {
        gameId: 'game-super-elements-2',
        gameName: 'Super Elements 2',
        category: 'slot',
        vendor: 'FA CHAI'
      });

      if (roundTotalWin >= currentBet * 15) {
        superElementsAudio.playBigWin();
        setBigWinAmount(roundTotalWin);
      }
    } else {
      if (!inFreeSpins) {
        gameEngine.recordRound(currentBet, 0, {
          gameId: 'game-super-elements-2',
          gameName: 'Super Elements 2',
          category: 'slot',
          vendor: 'FA CHAI'
        });
      }
    }

    // 3. Handle Free Spins Trigger & Counter
    if (!inFreeSpins && scatterCount >= 3) {
      // Trigger new Free Spins session
      const awardedSpins = 10 + (scatterCount - 3) * 2;
      superElementsAudio.playFreeSpinsTrigger();
      setIsFreeSpins(true);
      setFreeSpinsLeft(awardedSpins);
      setFreeSpinsTotalWin(0);
    } else if (inFreeSpins) {
      setFreeSpinsTotalWin(prev => prev + roundTotalWin);
      const remaining = freeSpinsLeftRef.current - 1;
      setFreeSpinsLeft(remaining);

      if (remaining <= 0) {
        setIsFreeSpins(false);
      }
    }

    setIsSpinning(false);

    // 4. Auto-spin continuation
    if (autoSpinRef.current > 0) {
      setAutoSpinCount(prev => prev - 1);
      setTimeout(() => {
        if (autoSpinRef.current > 0) {
          executeSpin();
        }
      }, isTurbo ? 250 : 600);
    }
  }, [isTurbo, isBn, onUpdateBalance, freeSpinsTotalWin]);

  // Handle Free Spins auto-run when inside active bonus round
  useEffect(() => {
    if (isFreeSpins && freeSpinsLeft > 0 && !isSpinning) {
      const timer = setTimeout(() => {
        executeSpin(true);
      }, isTurbo ? 500 : 1000);
      return () => clearTimeout(timer);
    }
  }, [isFreeSpins, freeSpinsLeft, isSpinning, isTurbo, executeSpin]);

  // Keyboard shortcut: Space to Spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinningRef.current && !showPaytable && !showBuyModal) {
        e.preventDefault();
        executeSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeSpin, showPaytable, showBuyModal]);

  // Buy Free Spins Feature (60x Bet)
  const handleBuyFreeSpins = () => {
    const cost = betAmount * 60;
    if (balance < cost) {
      alert(isBn ? 'ফ্রি স্পিন কেনার জন্য পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient balance to Buy Free Spins!');
      return;
    }
    setShowBuyModal(false);
    const newBal = balance - cost;
    setBalance(newBal);
    onUpdateBalance(newBal);

    superElementsAudio.playFreeSpinsTrigger();
    setIsFreeSpins(true);
    setFreeSpinsLeft(10);
    setFreeSpinsTotalWin(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Dynamic Cosmic Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, ${isFreeSpins ? '#6366f1' : '#0891b2'} 0%, #030712 70%)`
        }}
      />

      {/* Futuristic Grid Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-3 py-2 md:px-6 md:py-3 bg-slate-950/80 backdrop-blur-md border-b border-cyan-900/50 shadow-md">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isBn ? 'লবি' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              <Atom className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm md:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">
                  SUPER ELEMENTS 2
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  FC
                </span>
              </div>
              <div className="text-[10px] text-cyan-400 font-mono hidden sm:block">
                6 Reels • 3,600 Ways • Max 10,000X
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Multiplier Badge in Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-900 border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400 font-mono hidden md:inline">Multiplier:</span>
            <span className="text-sm md:text-base font-black font-mono text-amber-300">
              {currentMultiplier}X
            </span>
          </div>

          {isFreeSpins && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-900/90 border border-indigo-400/60 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span className="text-xs font-bold text-cyan-200">
                {isBn ? 'ফ্রি স্পিন বাকি:' : 'FREE SPINS:'} {freeSpinsLeft}
              </span>
            </div>
          )}
        </div>

        {/* Balance & Quick Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase leading-none">{isBn ? 'ব্যালেন্স' : 'Balance'}</div>
              <div className="text-xs md:text-sm font-bold text-amber-300 leading-tight">
                ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsTurbo(prev => !prev)}
            className={`p-2 rounded-lg transition ${isTurbo ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'}`}
            title="Turbo Spin"
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setShowPaytable(true)}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-2 md:p-4 max-w-5xl mx-auto w-full overflow-hidden">
        {/* Multiplier Ladder Bar */}
        <div className="w-full max-w-3xl mb-2 md:mb-3">
          <div className="flex items-center justify-between gap-1 md:gap-2 p-1.5 md:p-2 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="hidden sm:flex items-center gap-1.5 px-2 text-xs font-mono font-bold text-cyan-400">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isBn ? 'মাল্টিপ্লায়ার লেডার' : 'CASCADE LADDER'}:</span>
            </div>

            <div className="flex-1 grid grid-cols-5 gap-1 md:gap-2 font-mono text-center">
              {currentMultiplierSteps.map((mult, idx) => {
                const isActive = cascadeStep === idx;
                const isPassed = cascadeStep > idx;
                return (
                  <div
                    key={mult}
                    className={`py-1 md:py-1.5 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black border-amber-300 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.9)]'
                        : isPassed
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50'
                        : 'bg-slate-950/60 text-slate-500 border-slate-800'
                    }`}
                  >
                    <div className="text-[9px] md:text-[10px] uppercase tracking-wider opacity-80">
                      Step {idx + 1}
                    </div>
                    <div className="text-xs md:text-sm font-black">
                      {mult}X
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6 Reels × 5 Rows Gaming Matrix */}
        <div className="relative w-full max-w-3xl bg-slate-950/90 rounded-2xl p-2 md:p-3 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] backdrop-blur-sm">
          {/* Cybernetic Corner accents */}
          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br" />

          {/* Grid Layout: 6 Columns */}
          <div className="grid grid-cols-6 gap-1 md:gap-2">
            {grid.map((colCells, colIdx) => (
              <div 
                key={colIdx} 
                className="flex flex-col gap-1 md:gap-1.5 bg-slate-900/60 rounded-xl p-0.5 md:p-1 border border-cyan-950"
              >
                {colCells.map((cell) => (
                  <SuperElementsSymbolView key={cell.id} cell={cell} />
                ))}
              </div>
            ))}
          </div>

          {/* Win / Feedback Banner */}
          <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{isBn ? 'বেট:' : 'BET:'}</span>
              <span className="font-bold text-slate-200">৳{betAmount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{isBn ? 'উইন:' : 'WIN:'}</span>
              <span className={`font-black text-sm ${lastWin > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`}>
                ৳{lastWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Control Console */}
      <div className="relative z-20 bg-slate-950/95 border-t border-cyan-900/50 p-2 md:p-4 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left Controls: Bet Adjustments & Presets */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            {/* Buy Free Spins Button */}
            <button
              onClick={() => setShowBuyModal(true)}
              disabled={isSpinning || isFreeSpins}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-black shadow-[0_0_15px_rgba(168,85,247,0.5)] disabled:opacity-50 transition active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{isBn ? 'বোনাস কিনুন' : 'BUY BONUS'}</span>
              <span className="text-[10px] bg-black/40 px-1 py-0.5 rounded font-mono">60X</span>
            </button>

            {/* Bet Steppers */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setBetAmount(prev => Math.max(10, prev - 10))}
                disabled={isSpinning || betAmount <= 10}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="px-2 text-center min-w-[60px]">
                <div className="text-[9px] text-slate-400 font-mono">{isBn ? 'বেট' : 'BET'}</div>
                <div className="font-mono font-bold text-amber-300 text-sm">৳{betAmount}</div>
              </div>

              <button
                onClick={() => setBetAmount(prev => Math.min(2000, prev + 10))}
                disabled={isSpinning || betAmount >= 2000}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chips Quick Presets (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 font-mono text-xs">
              {betPresets.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBetAmount(preset)}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-lg border transition ${
                    betAmount === preset
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  ৳{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls: Auto Spin & Main Spin Button */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Auto Spin Toggle */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {autoSpinCount > 0 ? (
                <button
                  onClick={() => setAutoSpinCount(0)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>STOP ({autoSpinCount})</span>
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 px-1 font-mono">AUTO:</span>
                  {[10, 50].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => {
                        setAutoSpinCount(cnt);
                        executeSpin();
                      }}
                      disabled={isSpinning}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono disabled:opacity-50"
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Primary Glowing Spin Button */}
            <button
              onClick={() => executeSpin()}
              disabled={isSpinning}
              className={`relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full font-black text-slate-950 transition-all duration-200 active:scale-95 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-2 border-slate-700'
                  : 'bg-gradient-to-tr from-cyan-400 via-teal-300 to-amber-300 hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.8)] border-2 border-white'
              }`}
            >
              <RotateCcw className={`w-6 h-6 md:w-7 md:h-7 ${isSpinning ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Buy Free Spins Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            <Radio className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-black text-white mb-1">
              {isBn ? 'ফ্রি স্পিন ফিচার কিনুন' : 'BUY FREE SPINS'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isBn
                ? `৳${betAmount * 60} দিয়ে অবিলম্বে ১০টি ফ্রি স্পিন সক্রিয় করুন (বুস্টেড ১০X-২০X মাল্টিপ্লায়ার সহ)`
                : `Instantly trigger 10 Free Spins for ৳${betAmount * 60} with boosted 10X-20X multipliers!`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleBuyFreeSpins}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg"
              >
                {isBn ? 'নিশ্চিত করুন' : 'Confirm Buy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paytable Modal */}
      {showPaytable && (
        <SuperElementsPaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* Big Win Overlay */}
      {bigWinAmount !== null && (
        <SuperElementsWinOverlay
          amount={bigWinAmount}
          betAmount={betAmount}
          language={language}
          onDismiss={() => setBigWinAmount(null)}
        />
      )}
    </div>
  );
};
