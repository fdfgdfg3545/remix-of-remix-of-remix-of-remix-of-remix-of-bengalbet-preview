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
  Trophy, 
  Coins, 
  Minus, 
  Plus,
  Play,
  Pause
} from 'lucide-react';
import { UserAccount } from '../../types';
import { 
  BoxingCell, 
  MatchWin, 
  BASE_MULTIPLIER_LADDER, 
  FREE_SPINS_MULTIPLIER_LADDER 
} from './boxingKingTypes';
import { 
  createInitialGrid, 
  generateSpinGrid, 
  evaluateGridWins, 
  cascadeGrid, 
  countScatters 
} from './boxingKingEngine';
import { boxingKingAudio } from './boxingKingAudio';
import { BoxingSymbolView } from './BoxingSymbolView';
import { BoxingPaytableModal } from './BoxingPaytableModal';
import { BoxingWinOverlay } from './BoxingWinOverlay';
import { gameEngine } from '../../services/gameEngine';

interface BoxingKingGameProps {
  language: 'en' | 'bn';
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const BoxingKingGame: React.FC<BoxingKingGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const isBn = language === 'bn';

  // Game state
  const [balance, setBalance] = useState<number>(user.balance || 2500);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [grid, setGrid] = useState<BoxingCell[][]>(createInitialGrid);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [comboStep, setComboStep] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number>(0);

  // Modes & Modifiers
  const [isTitleMatch, setIsTitleMatch] = useState<boolean>(false); // Title Match: ExMATCH modifier
  const [isFreeSpins, setIsFreeSpins] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState<number>(0);

  // Settings & Overlays
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number | null>(null);

  // Refs for animation timeouts and loops
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

  const currentLadder = isFreeSpins ? FREE_SPINS_MULTIPLIER_LADDER : BASE_MULTIPLIER_LADDER;

  // Sound toggle
  const handleToggleMute = () => {
    const muted = boxingKingAudio.toggleMute();
    setIsMuted(muted);
  };

  // Quick Bet Selection
  const betPresets = [10, 20, 50, 100, 200, 500];

  // Helper sleep
  const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

  // Run a single spin sequence with cascading evaluation
  const executeSpin = useCallback(async (forcedFreeSpin = false) => {
    if (isSpinningRef.current) return;
    const currentBet = betAmountRef.current;
    const activeFreeSpins = forcedFreeSpin || isFreeSpinsRef.current;

    // Check balance if not free spins
    if (!activeFreeSpins) {
      if (balanceRef.current < currentBet) {
        setAutoSpinCount(0);
        return;
      }
      const newBal = balanceRef.current - currentBet;
      setBalance(newBal);
      onUpdateBalance(newBal);
    }

    setIsSpinning(true);
    setLastWin(0);
    setComboStep(0);

    boxingKingAudio.playSpinStart();

    const delayUnit = isTurbo ? 180 : 380;

    // 1. Generate new grid
    await wait(delayUnit);
    let currentGrid = generateSpinGrid(activeFreeSpins, isTitleMatch);
    setGrid(currentGrid);
    boxingKingAudio.playReelStop(2);

    let roundWin = 0;
    let step = 0;
    let keepCascading = true;

    // 2. Cascading Loop
    while (keepCascading) {
      const evalResult = evaluateGridWins(currentGrid, currentBet, step, activeFreeSpins);

      if (evalResult.wins.length > 0) {
        // Winning symbols found!
        roundWin += evalResult.totalRoundWin;
        setLastWin(roundWin);
        setGrid([...currentGrid.map(row => [...row])]);

        boxingKingAudio.playPunch(evalResult.totalRoundWin > currentBet * 5 ? 'heavy' : 'normal');
        boxingKingAudio.playComboMultiplier(step);

        // Wait to show winning highlights
        await wait(delayUnit + 100);

        // Next cascade step
        step = Math.min(step + 1, currentLadder.length - 1);
        setComboStep(step);

        // Drop surviving symbols and spawn new ones
        currentGrid = cascadeGrid(currentGrid, activeFreeSpins);
        setGrid(currentGrid);
        await wait(delayUnit);
      } else {
        keepCascading = false;
      }
    }

    // 3. Finalize round win
    if (roundWin > 0) {
      setBalance(prev => {
        const finalBal = prev + roundWin;
        onUpdateBalance(finalBal);
        return finalBal;
      });

      const cost = activeFreeSpins ? 0 : currentBet;
      gameEngine.recordRound(cost, roundWin, {
        gameId: 'game-boxing-king',
        gameName: 'Boxing King',
        category: 'slot',
        vendor: 'JILI'
      });

      if (activeFreeSpins) {
        setFreeSpinsTotalWin(prev => prev + roundWin);
      }

      // Check Big Win celebration
      if (roundWin >= currentBet * 20) {
        setBigWinAmount(roundWin);
      }
    } else {
      if (!activeFreeSpins) {
        gameEngine.recordRound(currentBet, 0, {
          gameId: 'game-boxing-king',
          gameName: 'Boxing King',
          category: 'slot',
          vendor: 'JILI'
        });
      }
    }

    // 4. Check for Scatter trigger if in Base Game
    if (!activeFreeSpins) {
      const scatters = countScatters(currentGrid);
      if (scatters >= 3) {
        const awardedSpins = scatters >= 5 ? 20 : scatters === 4 ? 12 : 8;
        boxingKingAudio.playScatterHit(scatters);
        boxingKingAudio.playBoxingBell();
        setIsFreeSpins(true);
        setFreeSpinsLeft(awardedSpins);
        setFreeSpinsTotalWin(0);
      }
    } else {
      // Free spin decrement
      const nextSpins = freeSpinsLeftRef.current - 1;
      setFreeSpinsLeft(nextSpins);
      if (nextSpins <= 0) {
        setIsFreeSpins(false);
        boxingKingAudio.playBoxingBell();
      }
    }

    setIsSpinning(false);

    // Auto spin handling
    if (autoSpinRef.current > 0 && !activeFreeSpins) {
      setAutoSpinCount(prev => prev - 1);
    }
  }, [isTurbo, isTitleMatch, onUpdateBalance, currentLadder]);

  // Handle Free Spins chain reaction
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFreeSpins && freeSpinsLeft > 0 && !isSpinning) {
      timer = setTimeout(() => {
        executeSpin(true);
      }, isTurbo ? 350 : 800);
    }
    return () => clearTimeout(timer);
  }, [isFreeSpins, freeSpinsLeft, isSpinning, executeSpin, isTurbo]);

  // Handle Auto Spin chain reaction
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpinCount > 0 && !isSpinning && !isFreeSpins) {
      timer = setTimeout(() => {
        executeSpin(false);
      }, isTurbo ? 350 : 700);
    }
    return () => clearTimeout(timer);
  }, [autoSpinCount, isSpinning, isFreeSpins, executeSpin, isTurbo]);

  // Keyboard Spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && !showPaytable && !bigWinAmount) {
        e.preventDefault();
        executeSpin(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, showPaytable, bigWinAmount, executeSpin]);

  // Instant Buy Feature (50x Bet)
  const handleBuyFreeSpins = () => {
    const cost = betAmount * 50;
    if (balance < cost || isSpinning || isFreeSpins) return;

    boxingKingAudio.playBoxingBell();
    const newBal = balance - cost;
    setBalance(newBal);
    onUpdateBalance(newBal);

    setIsFreeSpins(true);
    setFreeSpinsLeft(8);
    setFreeSpinsTotalWin(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07040d] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Dynamic Stadium Arena Lighting Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-80 bg-yellow-500/20 blur-[120px]" />
      </div>

      {/* TOP BAR */}
      <div className="relative z-10 flex items-center justify-between px-3 py-2 bg-[#0c0817]/90 border-b border-zinc-800/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-amber-500">
                BOXING KING
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 font-bold border border-red-500/40">
                JILI
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isBn ? '৮৮ পে-লাইন • ক্যাসকেডিং কম্বো' : '88 Ways • Cascading Combos'}
            </p>
          </div>
        </div>

        {/* Edition Mode Switcher */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-700/60">
          <button
            onClick={() => setIsTitleMatch(false)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              !isTitleMatch
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            CLASSIC (2000X)
          </button>
          <button
            onClick={() => setIsTitleMatch(true)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
              isTitleMatch
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300" />
            TITLE MATCH (10,000X)
          </button>
        </div>

        {/* Balance & Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-end bg-black/50 px-3 py-1 rounded-xl border border-zinc-800">
            <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
              {isBn ? 'ব্যালেন্স' : 'BALANCE'}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
              ৳{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl transition ${
              isMuted ? 'bg-red-950 text-red-400' : 'bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowPaytable(true)}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MULTIPLIER COMBO LADDER HEADER */}
      <div className="relative z-10 px-3 py-2 bg-gradient-to-r from-red-950/80 via-[#130d22]/90 to-blue-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
            {isFreeSpins 
              ? (isBn ? '🔥 ফ্রি স্পিন মাল্টিপ্লায়ার' : '🔥 FREE SPINS MULTIPLIER') 
              : (isBn ? 'ক্যাসকেড কম্বো গুণক' : 'CASCADE COMBO LADDER')}
          </span>
        </div>

        {/* Active Multiplier Steps */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentLadder.map((mult, idx) => {
            const isActive = idx <= comboStep;
            const isCurrent = idx === comboStep;
            return (
              <div
                key={idx}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-black transition-all duration-300 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black scale-110 shadow-[0_0_12px_rgba(250,204,21,0.9)] ring-2 ring-white'
                    : isActive
                    ? 'bg-red-700/70 text-yellow-200 border border-red-500/50'
                    : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'
                }`}
              >
                {mult}X
              </div>
            );
          })}
        </div>

        {/* Free Spins Alert */}
        {isFreeSpins && (
          <div className="flex items-center gap-2 bg-red-600 px-2.5 py-0.5 rounded-full text-white font-black text-xs animate-pulse">
            <span>ROUND {freeSpinsLeft}</span>
          </div>
        )}
      </div>

      {/* MAIN GAME STAGE: 5x5 BOXING RING */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
        {/* Ring Corner Posts & Ropes Container */}
        <div className="relative w-full max-w-lg aspect-square p-3 sm:p-4 bg-gradient-to-b from-[#1a1228] to-[#0d0914] rounded-3xl border-4 border-yellow-500/80 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col">
          {/* Top Ring Rope */}
          <div className="absolute top-2 left-4 right-4 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600 rounded-full shadow" />
          <div className="absolute bottom-2 left-4 right-4 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-blue-600 rounded-full shadow" />

          {/* 5x5 Grid */}
          <div className="flex-1 grid grid-cols-5 grid-rows-5 gap-1.5 sm:gap-2">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <div key={cell.id} className="relative w-full h-full">
                  <BoxingSymbolView
                    symbol={cell.symbol}
                    isWinning={cell.isWinning}
                    isExMatch={cell.isExMatch}
                  />
                </div>
              ))
            )}
          </div>

          {/* Winning payout ribbon when win occurs */}
          {lastWin > 0 && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-full border-2 border-yellow-300 shadow-[0_0_15px_rgba(239,68,68,0.9)] text-center animate-bounce">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">
                {isBn ? 'জয়:' : 'WIN:'} ৳{lastWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS & BET BAR */}
      <div className="relative z-10 bg-[#0c0817]/95 border-t border-zinc-800 p-2 sm:p-3 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Buy Feature & Presets */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={handleBuyFreeSpins}
              disabled={balance < betAmount * 50 || isSpinning || isFreeSpins}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 disabled:opacity-40 text-black font-black text-xs rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.6)] flex items-center gap-1.5 transition active:scale-95"
            >
              <Trophy className="w-4 h-4 text-black" />
              <span>{isBn ? 'ফ্রি স্পিন কিনুন (৫০x)' : 'BUY FREE SPINS (50X)'}</span>
            </button>

            {/* Quick Chips */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {betPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBetAmount(preset)}
                  disabled={isSpinning || isFreeSpins}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    betAmount === preset
                      ? 'bg-yellow-400 text-black font-black ring-1 ring-white'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  ৳{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Center: Bet Adjustment Stepper */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-bold uppercase">
              {isBn ? 'বাজি' : 'BET'}:
            </span>
            <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700 p-0.5">
              <button
                onClick={() => setBetAmount(prev => Math.max(10, prev - 10))}
                disabled={isSpinning || isFreeSpins || betAmount <= 10}
                className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 font-mono font-bold text-amber-400 text-sm min-w-[60px] text-center">
                ৳{betAmount}
              </span>
              <button
                onClick={() => setBetAmount(prev => prev + 10)}
                disabled={isSpinning || isFreeSpins}
                className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Turbo, Auto Spin & Giant FIGHT/SPIN Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Turbo toggle */}
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`p-2 rounded-xl text-xs font-black flex items-center gap-1 transition ${
                isTurbo 
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.8)]' 
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>TURBO</span>
            </button>

            {/* Auto Spin */}
            <button
              onClick={() => setAutoSpinCount(prev => prev > 0 ? 0 : 25)}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                autoSpinCount > 0 
                  ? 'bg-red-600 text-white shadow animate-pulse' 
                  : 'bg-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {autoSpinCount > 0 ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{autoSpinCount > 0 ? `AUTO (${autoSpinCount})` : 'AUTO'}</span>
            </button>

            {/* Giant SPIN / FIGHT Button */}
            <button
              onClick={() => executeSpin(false)}
              disabled={isSpinning || (balance < betAmount && !isFreeSpins)}
              className="relative px-6 py-2.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 disabled:opacity-40 text-white font-black text-sm sm:text-base rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.8)] border border-yellow-300 transition transform active:scale-95 flex items-center gap-2"
            >
              <span className="text-xl">🥊</span>
              <span>{isSpinning ? (isBn ? 'লড়াই...' : 'FIGHTING...') : (isBn ? 'স্পিন' : 'SPIN')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paytable & Rules Modal */}
      {showPaytable && (
        <BoxingPaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* Big Win / Knockout Celebration */}
      {bigWinAmount !== null && (
        <BoxingWinOverlay
          amount={bigWinAmount}
          betAmount={betAmount}
          language={language}
          onClose={() => setBigWinAmount(null)}
        />
      )}
    </div>
  );
};
